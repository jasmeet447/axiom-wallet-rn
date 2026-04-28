import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setUnlocked,
  setAuthLoading,
  setAuthError,
  clearAuthError,
} from '../../../store';
import { updateManagedWallet } from '../../../store/slices/walletSlice';
import { walletStorageService } from '../../../core/api/walletStorageService';
import { wdkService } from '../../../core/api/wdkService';

/**
 * Handles biometric unlock for the currently active wallet.
 *
 * unlock() — triggers the OS biometric prompt via the active wallet's
 * Keychain entry.  On success, the wallet address is populated in Redux
 * (from the decrypted mnemonic) and isUnlocked is set to true.
 */
export const useBiometricAuth = () => {
  const dispatch = useAppDispatch();
  const { isInitialised, isAuthenticated, isUnlocked, isLoading, error } =
    useAppSelector(state => state.auth);
  const { activeWalletId, wallets } = useAppSelector(state => state.wallet);

  const unlock = useCallback(async (): Promise<void> => {
    if (!activeWalletId) {
      dispatch(setAuthError('No wallet found. Please create a wallet first.'));
      return;
    }

    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());

    try {
      const mnemonic = await walletStorageService.retrieveMnemonic(
        activeWalletId,
      );

      if (!mnemonic) {
        // User cancelled or biometric unavailable — don't surface as an error
        dispatch(setAuthLoading(false));
        return;
      }

      // Populate the wallet address from the decrypted mnemonic
      const address = wdkService.getAddressFromMnemonic(mnemonic);
      const existing = wallets.find(w => w.id === activeWalletId);
      if (existing && !existing.address) {
        dispatch(updateManagedWallet({ id: activeWalletId, address }));
      }

      dispatch(setUnlocked(true));
    } catch (e: any) {
      dispatch(setAuthError(e?.message ?? 'Biometric authentication failed.'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  }, [dispatch, activeWalletId, wallets]);

  return {
    unlock,
    isInitialised,
    isAuthenticated,
    isUnlocked,
    isLoading,
    error,
  };
};
