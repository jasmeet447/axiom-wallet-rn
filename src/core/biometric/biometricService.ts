import * as Keychain from 'react-native-keychain';

export interface BiometricCredentials {
  username: string;
  password: string;
}

// Discriminated union returned by retrieveWalletSecret so callers can handle
// "user cancelled" separately from a real failure without relying on null.
export type BiometricResult =
  | { ok: true; secret: string }
  | { ok: false; cancelled: boolean; error: string };

// Service keys
const SERVICE_WALLET = 'AxiomWallet';
/** Existence flag stored WITHOUT biometric protection so we can check it on
 *  boot without triggering the OS biometric prompt. */
const SERVICE_META = 'AxiomWallet_Meta';

export const biometricService = {
  // Check if biometric authentication is available
  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  // Get supported biometry type
  getBiometryType: async (): Promise<Keychain.BIOMETRY_TYPE | null> => {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  },

  // Store credentials with biometric protection
  storeCredentials: async (
    username: string,
    password: string,
    serviceName = 'AxiomWallet',
  ): Promise<boolean> => {
    try {
      await Keychain.setGenericPassword(username, password, {
        service: serviceName,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      });
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  },

  // Retrieve credentials with biometric authentication
  retrieveCredentials: async (
    serviceName = 'AxiomWallet',
  ): Promise<BiometricCredentials | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: serviceName,
        authenticationPrompt: {
          title: 'Authenticate to access your wallet',
          subtitle: 'Use biometric authentication',
        },
      });

      if (credentials && credentials.username && credentials.password) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  },

  // Delete stored credentials
  deleteCredentials: async (serviceName = 'AxiomWallet'): Promise<boolean> => {
    try {
      await Keychain.resetGenericPassword({ service: serviceName });
      return true;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  },

  // Store PIN code securely
  storePIN: async (pin: string): Promise<boolean> => {
    return biometricService.storeCredentials('pin', pin, 'AxiomWallet_PIN');
  },

  // Retrieve PIN code
  retrievePIN: async (): Promise<string | null> => {
    const credentials = await biometricService.retrieveCredentials(
      'AxiomWallet_PIN',
    );
    return credentials?.password || null;
  },

  // Delete PIN code
  deletePIN: async (): Promise<boolean> => {
    return biometricService.deleteCredentials('AxiomWallet_PIN');
  },

  // ─── Wallet-lifecycle helpers ───────────────────────────────────────────────

  /**
   * Check whether a wallet has been set up WITHOUT triggering the biometric
   * prompt. Uses a plain (non-biometric-protected) existence flag.
   */
  hasStoredWallet: async (): Promise<boolean> => {
    try {
      const result = await Keychain.getGenericPassword({
        service: SERVICE_META,
      });
      return result !== false;
    } catch {
      return false;
    }
  },

  /**
   * Persist the wallet secret with full biometric protection AND write the
   * plain existence flag so hasStoredWallet() can return true on next boot.
   */
  setupWallet: async (walletSecret: string): Promise<boolean> => {
    try {
      // Biometric-protected credential
      await Keychain.setGenericPassword('wallet', walletSecret, {
        service: SERVICE_WALLET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      });
      // Plain existence flag — no access-control so it can be read before prompt
      await Keychain.setGenericPassword('wallet', 'exists', {
        service: SERVICE_META,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      return true;
    } catch (error) {
      console.error('Error setting up wallet:', error);
      return false;
    }
  },

  /**
   * Retrieve the wallet secret. Triggers the OS biometric prompt.
   * Returns a typed BiometricResult — never throws — so callers can
   * differentiate user-cancel from an actual error.
   */
  retrieveWalletSecret: async (
    serviceName = SERVICE_WALLET,
  ): Promise<BiometricResult> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: serviceName,
        authenticationPrompt: {
          title: 'Unlock your wallet',
          subtitle: 'Verify your identity to continue',
          cancel: 'Cancel',
        },
      });
      if (credentials && credentials.password) {
        return { ok: true, secret: credentials.password };
      }
      return { ok: false, cancelled: false, error: 'No credentials found.' };
    } catch (error: any) {
      const message: string = error?.message ?? String(error);
      // Heuristic: iOS uses LAErrorUserCancel (-128) and the message includes
      // "cancel". Android surfaces a similar string. Treat as soft cancel.
      const cancelled =
        /cancel/i.test(message) ||
        (typeof error?.code === 'number' && error.code === -128);
      return {
        ok: false,
        cancelled,
        error: cancelled
          ? 'Cancelled by user.'
          : message || 'Authentication failed.',
      };
    }
  },

  /**
   * Wipe both the biometric credential and the existence flag.
   * Call on logout or wallet reset.
   */
  deleteWallet: async (): Promise<boolean> => {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE_WALLET });
      await Keychain.resetGenericPassword({ service: SERVICE_META });
      return true;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      return false;
    }
  },
};
