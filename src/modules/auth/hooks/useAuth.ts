import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setUser, resetAuthState } from '../../../store/slices/authSlice';
import { resetWalletState } from '../../../store/slices/walletSlice';
import { resetTransactionsState } from '../../../store/slices/transactionsSlice';
import { biometricService } from '../../../core/biometric/biometricService';
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

  /** Full logout: wipes keychain, resets all slices. */
  const logout = useCallback(async () => {
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
