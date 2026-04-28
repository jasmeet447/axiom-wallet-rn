import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  setWallet,
  updateBalance,
  setLoading,
  setError,
  clearError,
} from '../../../store/slices/walletSlice';
import type { WalletData } from '../../../store/slices/walletSlice';

export const useWallet = () => {
  const dispatch = useAppDispatch();
  const { wallet, isLoading, error, refreshing } = useAppSelector(
    state => state.wallet,
  );

  const loadWallet = useCallback(
    (walletData: WalletData) => {
      dispatch(setWallet(walletData));
    },
    [dispatch],
  );

  const refreshBalance = useCallback(
    (balance: string) => {
      dispatch(updateBalance(balance));
    },
    [dispatch],
  );

  const setWalletLoading = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch],
  );

  const setWalletError = useCallback(
    (errorMsg: string) => {
      dispatch(setError(errorMsg));
    },
    [dispatch],
  );

  const clearWalletError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    wallet,
    isLoading,
    error,
    refreshing,
    loadWallet,
    refreshBalance,
    setWalletLoading,
    setWalletError,
    clearWalletError,
  };
};
