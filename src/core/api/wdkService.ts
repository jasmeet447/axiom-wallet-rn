/**
 * WDK Service
 *
 * Implements wallet lifecycle using the same cryptographic primitives as WDK:
 *  - @scure/bip39  — BIP-39 mnemonic generation & validation (used internally
 *                    by @tetherto/pear-wrk-wdk's secrets handler)
 *  - @scure/bip32  — BIP-32 HD key derivation
 *  - @noble/curves — secp256k1 public-key operations
 *  - @noble/hashes — keccak-256 for EVM address derivation
 *
 * This approach runs entirely on the main thread (no Bare worklet thread),
 * which is the documented alternative when the wdk-worklet-bundler is not used.
 *
 * All sensitive material (mnemonic, seed, private keys) is NEVER stored in
 * plain-text.  Only the wallet metadata (walletId, network, address) lives in
 * Redux.  The raw mnemonic is returned once at creation time so the UI can show
 * it to the user and then forgotten.
 */

import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3';
import { walletStorageService } from './walletStorageService';

// ─── Types ────────────────────────────────────────────────────────────────────

/** EVM derivation path (account #0 by default, BIP-44 for Ethereum). */
const EVM_DERIVATION_PATH = "m/44'/60'/0'/0/0";

export type WalletNetwork = 'ethereum';

export interface ManagedWallet {
  /** Unique identifier chosen by the user (e.g. "Main Wallet"). */
  id: string;
  /** Display name (same as id initially, user can rename later). */
  name: string;
  /** EVM address derived from the mnemonic. */
  address: string;
  /** The network this wallet operates on. */
  network: WalletNetwork;
  /** Unix ms when the wallet was created. */
  createdAt: number;
}

/** Returned only at wallet creation/import — contains the one-time mnemonic. */
export interface WalletCreationResult {
  wallet: ManagedWallet;
  /** 12-word BIP-39 mnemonic. Show once, never store in Redux or AsyncStorage. */
  mnemonic: string;
}

// ─── EVM address helper ───────────────────────────────────────────────────────

/**
 * Derives a checksummed EVM address from a BIP-39 mnemonic following
 * BIP-44 path m/44'/60'/0'/0/0 (first Ethereum account).
 */
function deriveEvmAddress(mnemonic: string): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(EVM_DERIVATION_PATH);

  if (!child.privateKey) {
    throw new Error('Failed to derive private key from mnemonic.');
  }

  // Compressed public key → uncompressed (64-byte X || Y without 0x04 prefix)
  const pubKey = secp256k1.getPublicKey(child.privateKey, false);
  const pubKeyBytes = pubKey.slice(1); // strip the 0x04 prefix byte

  // keccak256 of the 64-byte public key → take last 20 bytes → EVM address
  const hash = keccak_256(pubKeyBytes);
  const addressBytes = hash.slice(12); // last 20 bytes

  return toChecksumAddress(
    '0x' +
      Array.from(addressBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
  );
}

/**
 * EIP-55 checksum address encoding.
 * Ref: https://eips.ethereum.org/EIPS/eip-55
 */
function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace('0x', '');
  const hash = Array.from(keccak_256(addr))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return (
    '0x' +
    addr
      .split('')
      .map((char, i) =>
        parseInt(hash[i], 16) >= 8 ? char.toUpperCase() : char,
      )
      .join('')
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const wdkService = {
  /**
   * Validate a mnemonic phrase using both the WDK validator (word-count check)
   * and the strict @scure/bip39 wordlist validator.
   */
  validateMnemonic(mnemonic: string): boolean {
    const trimmed = mnemonic.trim();
    // @scure/bip39 validates both the word list and the 12/24-word length
    return bip39.validateMnemonic(trimmed, wordlist);
  },

  /**
   * Generate a new 12-word BIP-39 mnemonic.
   * Uses @scure/bip39 with 128 bits of entropy — same as pear-wrk-wdk internals.
   */
  generateMnemonic(): string {
    return bip39.generateMnemonic(wordlist, 128);
  },

  /**
   * Create a brand-new wallet:
   *  1. Generate a fresh 12-word mnemonic.
   *  2. Derive the EVM address.
   *  3. Store the mnemonic securely in the system Keychain (biometric-protected).
   *  4. Return wallet metadata + one-time mnemonic for seed-phrase backup.
   */
  async createWallet(walletId: string): Promise<WalletCreationResult> {
    const mnemonic = wdkService.generateMnemonic();
    const address = deriveEvmAddress(mnemonic);

    // Store mnemonic in keychain, protected by device biometrics
    await walletStorageService.storeMnemonic(walletId, mnemonic);

    const wallet: ManagedWallet = {
      id: walletId,
      name: walletId,
      address,
      network: 'ethereum',
      createdAt: Date.now(),
    };

    return { wallet, mnemonic };
  },

  /**
   * Import an existing wallet from a seed phrase:
   *  1. Validate the mnemonic (BIP-39 wordlist + length check).
   *  2. Derive the EVM address.
   *  3. Store securely in the Keychain.
   *  4. Return wallet metadata (mnemonic is NOT returned — user already knows it).
   */
  async importWallet(
    walletId: string,
    mnemonic: string,
  ): Promise<ManagedWallet> {
    const trimmed = mnemonic.trim();
    if (!wdkService.validateMnemonic(trimmed)) {
      throw new Error(
        'Invalid mnemonic phrase. Please check each word and try again.',
      );
    }

    const address = deriveEvmAddress(trimmed);
    await walletStorageService.storeMnemonic(walletId, trimmed);

    return {
      id: walletId,
      name: walletId,
      address,
      network: 'ethereum',
      createdAt: Date.now(),
    };
  },

  /**
   * Retrieve the mnemonic for an existing wallet.
   * Triggers the OS biometric prompt (uses biometric-protected Keychain entry).
   */
  async getMnemonic(walletId: string): Promise<string | null> {
    return walletStorageService.retrieveMnemonic(walletId);
  },

  /**
   * Permanently delete a wallet: wipes the Keychain entry.
   * Redux state must be cleaned up separately by the caller.
   */
  async deleteWallet(walletId: string): Promise<void> {
    await walletStorageService.deleteMnemonic(walletId);
  },

  /**
   * Synchronously derive the EVM address from a known mnemonic (no keychain).
   * Useful after a successful biometric unlock when the mnemonic is already in hand.
   */
  getAddressFromMnemonic(mnemonic: string): string {
    return deriveEvmAddress(mnemonic.trim());
  },

  /**
   * Re-derive the EVM address for an existing wallet (requires biometric auth
   * to retrieve the mnemonic from keychain).
   */
  async getAddress(walletId: string): Promise<string | null> {
    const mnemonic = await walletStorageService.retrieveMnemonic(walletId);
    if (!mnemonic) return null;
    return deriveEvmAddress(mnemonic);
  },
};
