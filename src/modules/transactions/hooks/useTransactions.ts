import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  setTransactions,
  addTransaction,
  updateTransaction,
  setLoading,
} from '../../../store/slices/transactionsSlice';
import type { Transaction } from '../../../store/slices/transactionsSlice';

export const useTransactions = () => {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, error, hasMore, page } = useAppSelector(
    state => state.transactions,
  );

  const loadTransactions = useCallback(
    (txs: Transaction[]) => {
      dispatch(setTransactions(txs));
    },
    [dispatch],
  );

  const addNewTransaction = useCallback(
    (tx: Transaction) => {
      dispatch(addTransaction(tx));
    },
    [dispatch],
  );

  const updateExistingTransaction = useCallback(
    (tx: Transaction) => {
      dispatch(updateTransaction(tx));
    },
    [dispatch],
  );

  const setTransactionsLoading = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch],
  );

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    page,
    loadTransactions,
    addNewTransaction,
    updateExistingTransaction,
    setTransactionsLoading,
  };
};
