/**
 * Wallet Storage Service
 *
 * Manages per-wallet secure keychain storage.  Each wallet uses its own
 * Keychain service key so wallets are isolated and can be individually wiped.
 *
 * The mnemonic is stored with biometric access control — the OS FaceID/Touch ID
 * prompt is triggered automatically when retrieving.
 */

import * as Keychain from 'react-native-keychain';

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_PREFIX = 'AxiomWallet_mnemonic_';

// A plain (non-biometric) registry lists which wallet IDs exist so we can
// enumerate them without triggering the biometric prompt on every boot.
const REGISTRY_SERVICE = 'AxiomWallet_walletRegistry';
const REGISTRY_USERNAME = 'registry';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serviceKey(walletId: string): string {
  // Sanitise: remove characters that could cause Keychain issues
  return SERVICE_PREFIX + walletId.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function readRegistry(): Promise<string[]> {
  try {
    const result = await Keychain.getGenericPassword({
      service: REGISTRY_SERVICE,
    });
    if (!result) return [];
    return JSON.parse(result.password) as string[];
  } catch {
    return [];
  }
}

async function writeRegistry(ids: string[]): Promise<void> {
  await Keychain.setGenericPassword(
    REGISTRY_USERNAME,
    JSON.stringify([...new Set(ids)]),
    {
      service: REGISTRY_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    },
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const walletStorageService = {
  /**
   * Persist a mnemonic in the Keychain with biometric protection.
   * Also registers the walletId in the plain registry so it can be
   * enumerated on next launch without a biometric prompt.
   */
  async storeMnemonic(walletId: string, mnemonic: string): Promise<void> {
    await Keychain.setGenericPassword(walletId, mnemonic, {
      service: serviceKey(walletId),
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    });

    const ids = await readRegistry();
    if (!ids.includes(walletId)) {
      await writeRegistry([...ids, walletId]);
    }
  },

  /**
   * Retrieve the mnemonic from the Keychain.
   * Triggers the OS biometric prompt automatically.
   * Returns null if no entry exists for the given walletId.
   */
  async retrieveMnemonic(walletId: string): Promise<string | null> {
    try {
      const result = await Keychain.getGenericPassword({
        service: serviceKey(walletId),
        authenticationPrompt: {
          title: 'Authenticate to access your wallet',
          subtitle: 'Confirm your identity to continue',
          cancel: 'Cancel',
        },
      });
      return result ? result.password : null;
    } catch {
      return null;
    }
  },

  /**
   * Check whether a mnemonic entry exists for the given walletId
   * WITHOUT triggering the biometric prompt (reads the plain registry).
   */
  async hasMnemonic(walletId: string): Promise<boolean> {
    const ids = await readRegistry();
    return ids.includes(walletId);
  },

  /**
   * Return all registered wallet IDs.  No biometric prompt.
   */
  async listWalletIds(): Promise<string[]> {
    return readRegistry();
  },

  /**
   * Wipe the Keychain entry for a given wallet and remove it from the registry.
   */
  async deleteMnemonic(walletId: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: serviceKey(walletId) });

    const ids = await readRegistry();
    await writeRegistry(ids.filter(id => id !== walletId));
  },

  /**
   * Wipe ALL wallet entries.  Used on full app reset / account deletion.
   */
  async deleteAllMnemonics(): Promise<void> {
    const ids = await readRegistry();
    await Promise.all(
      ids.map(id => Keychain.resetGenericPassword({ service: serviceKey(id) })),
    );
    await Keychain.resetGenericPassword({ service: REGISTRY_SERVICE });
  },
};
