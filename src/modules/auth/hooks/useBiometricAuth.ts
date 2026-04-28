import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setAuthenticated,
  setUnlocked,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  setInitialised,
} from '../../../store';
import {
  biometricService,
  BiometricResult,
} from '../../../core/biometric/biometricService';

/**
 * Handles the two-phase auth lifecycle:
 *
 * 1. bootstrap()  — called once on app mount; silently checks whether a wallet
 *    exists in the keychain (NO biometric prompt) and initialises redux state.
 *
 * 2. unlock()     — triggers the OS biometric prompt to retrieve the wallet
 *    secret.  Dispatches setUnlocked(true) on success, or surfaces the error
 *    to Redux state for the UI to display.  Returns the raw BiometricResult so
 *    callers can act on the decrypted secret when needed (e.g. wallet init).
 */
export const useBiometricAuth = () => {
  const dispatch = useAppDispatch();
  const { isInitialised, isAuthenticated, isUnlocked, isLoading, error } =
    useAppSelector(state => state.auth);

  const bootstrap = useCallback(async (): Promise<void> => {
    dispatch(setAuthLoading(true));
    try {
      const walletExists = await biometricService.hasStoredWallet();
      if (walletExists) {
        dispatch(setAuthenticated(true));
      }
    } finally {
      dispatch(setAuthLoading(false));
      dispatch(setInitialised(true));
    }
  }, [dispatch]);

  const unlock = useCallback(async (): Promise<BiometricResult> => {
    dispatch(setAuthLoading(true));
    dispatch(clearAuthError());

    const result = await biometricService.retrieveWalletSecret();

    dispatch(setAuthLoading(false));

    if (result.ok) {
      dispatch(setUnlocked(true));
    } else if (!result.cancelled) {
      // Don't surface a "cancelled" state as an error — it's intentional
      dispatch(setAuthError(result.error));
    }

    return result;
  }, [dispatch]);

  return {
    bootstrap,
    unlock,
    isInitialised,
    isAuthenticated,
    isUnlocked,
    isLoading,
    error,
  };
};
