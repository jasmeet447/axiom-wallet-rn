import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setUser, resetAuthState } from '../../../store/slices/authSlice';
import { resetWalletState } from '../../../store/slices/walletSlice';
import { resetTransactionsState } from '../../../store/slices/transactionsSlice';
import { biometricService } from '../../../core/biometric/biometricService';
import { walletStorageService } from '../../../core/api/walletStorageService';
import type { User } from '../../../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {
    user,
    isAuthenticated,
    isUnlocked,
    isLoading,
    error,
    biometricEnabled,
  } = useAppSelector(state => state.auth);

  const login = useCallback(
    (_user: User) => {
      dispatch(setUser(_user));
    },
    [dispatch],
  );

  /** Full logout: wipes ALL keychain entries (per-wallet mnemonics +
   *  biometric credential), then resets every Redux slice. */
  const logout = useCallback(async () => {
    // Wipe per-wallet mnemonic entries from Keychain
    await walletStorageService.deleteAllMnemonics();
    // Wipe the legacy biometricService credential (SERVICE_WALLET + META)
    await biometricService.deleteWallet();
    dispatch(resetAuthState());
    dispatch(resetWalletState());
    dispatch(resetTransactionsState());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isUnlocked,
    isLoading,
    error,
    biometricEnabled,
    login,
    logout,
  };
};
