/**
 * useWdkWallet
 *
 * Central hook for wallet lifecycle operations.  Abstracts over wdkService and
 * walletStorageService so UI components never import from core/api directly.
 *
 * Responsibilities:
 *  - createWallet  → generates mnemonic, stores securely, updates Redux
 *  - importWallet  → validates mnemonic, stores securely, updates Redux
 *  - deleteWallet  → wipes keychain + Redux entry
 *  - switchWallet  → changes the active wallet in Redux
 *  - revealMnemonic → triggers biometric prompt, returns mnemonic once
 */

import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addManagedWallet,
  removeManagedWallet,
  setActiveWallet,
} from '../../../store/slices/walletSlice';
import {
  setAuthenticated,
  setUnlocked,
  resetAuthState,
} from '../../../store/slices/authSlice';
import { resetTransactionsState } from '../../../store/slices/transactionsSlice';
import { resetWalletState } from '../../../store/slices/walletSlice';
import { wdkService } from '../../../core/api/wdkService';
import { walletStorageService } from '../../../core/api/walletStorageService';
import type {
  ManagedWallet,
  WalletCreationResult,
} from '../../../core/api/wdkService';

export interface UseWdkWalletReturn {
  // ── State ─────────────────────────────────────────────────────────────────
  wallets: ManagedWallet[];
  activeWallet: ManagedWallet | null;
  activeWalletId: string | null;
  isLoading: boolean;
  error: string | null;

  // ── Operations ────────────────────────────────────────────────────────────
  /** Generate a mnemonic preview without creating or storing anything. */
  generateMnemonic: () => string;
  /** Create a new wallet. Returns creation result with one-time mnemonic. */
  createWallet: (walletId: string) => Promise<WalletCreationResult>;
  /** Import a wallet from an existing seed phrase. */
  importWallet: (walletId: string, mnemonic: string) => Promise<ManagedWallet>;
  /** Delete a wallet permanently (wipes keychain + Redux). */
  deleteWallet: (walletId: string) => Promise<void>;
  /** Switch the active wallet. */
  switchWallet: (walletId: string) => void;
  /** Trigger biometric prompt to reveal mnemonic. Returns null if cancelled. */
  revealMnemonic: (walletId: string) => Promise<string | null>;
  /** Validate a mnemonic phrase (no side effects). */
  validateMnemonic: (mnemonic: string) => boolean;
  clearError: () => void;
}

export function useWdkWallet(): UseWdkWalletReturn {
  const dispatch = useAppDispatch();
  const { wallets, activeWalletId } = useAppSelector(state => state.wallet);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeWallet = wallets.find(w => w.id === activeWalletId) ?? null;

  const generateMnemonic = useCallback((): string => {
    return wdkService.generateMnemonic();
  }, []);

  const createWallet = useCallback(
    async (walletId: string): Promise<WalletCreationResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await wdkService.createWallet(walletId);
        dispatch(addManagedWallet(result.wallet));
        dispatch(setAuthenticated(true));
        dispatch(setUnlocked(true));
        return result;
      } catch (e: any) {
        const msg = e?.message ?? 'Failed to create wallet.';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch],
  );

  const importWallet = useCallback(
    async (walletId: string, mnemonic: string): Promise<ManagedWallet> => {
      setIsLoading(true);
      setError(null);
      try {
        const wallet = await wdkService.importWallet(walletId, mnemonic);
        dispatch(addManagedWallet(wallet));
        dispatch(setAuthenticated(true));
        dispatch(setUnlocked(true));
        return wallet;
      } catch (e: any) {
        const msg = e?.message ?? 'Failed to import wallet.';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch],
  );

  const deleteWallet = useCallback(
    async (walletId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await wdkService.deleteWallet(walletId);
        dispatch(removeManagedWallet(walletId));

        // If there are no wallets left, reset auth state completely
        const remainingIds = await walletStorageService.listWalletIds();
        if (remainingIds.length === 0) {
          dispatch(resetAuthState());
          dispatch(resetWalletState());
          dispatch(resetTransactionsState());
        }
      } catch (e: any) {
        setError(e?.message ?? 'Failed to delete wallet.');
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch],
  );

  const switchWallet = useCallback(
    (walletId: string) => {
      dispatch(setActiveWallet(walletId));
    },
    [dispatch],
  );

  const revealMnemonic = useCallback(
    async (walletId: string): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      try {
        return await wdkService.getMnemonic(walletId);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to retrieve mnemonic.');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const validateMnemonic = useCallback((mnemonic: string): boolean => {
    return wdkService.validateMnemonic(mnemonic);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    wallets,
    activeWallet,
    activeWalletId,
    isLoading,
    error,
    generateMnemonic,
    createWallet,
    importWallet,
    deleteWallet,
    switchWallet,
    revealMnemonic,
    validateMnemonic,
    clearError,
  };
}
