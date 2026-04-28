import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import {
  setTransactions,
  appendTransactions,
  addTransaction,
  updateTransaction,
  setLoading,
  setError,
  clearError,
  setHasMore,
  incrementPage,
  resetPagination,
} from '../../../store/slices/transactionsSlice';
import type { Transaction } from '../../../store/slices/transactionsSlice';
import { blockchainApi } from '../../../core/api/blockchainApi';
import type { BlockchainTransaction } from '../../../core/api/blockchainApi';

const PAGE_SIZE = 20;

function mapTx(raw: BlockchainTransaction, myAddress: string): Transaction {
  return {
    id: raw.hash,
    hash: raw.hash,
    from: raw.from,
    to: raw.to,
    value: raw.value,
    timestamp: raw.timestamp,
    status: raw.status,
    type:
      raw.from.toLowerCase() === myAddress.toLowerCase() ? 'send' : 'receive',
    confirmations: raw.confirmations,
  };
}

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

  /** Hard-refresh: reset pagination and reload from page 0. */
  const fetchTransactions = useCallback(
    async (address: string) => {
      dispatch(setLoading(true));
      dispatch(clearError());
      dispatch(resetPagination());
      try {
        const raw = await blockchainApi.getTransactions(address, 0, PAGE_SIZE);
        dispatch(setTransactions(raw.map(tx => mapTx(tx, address))));
        dispatch(setHasMore(raw.length === PAGE_SIZE));
      } catch (e: any) {
        dispatch(setError(e?.message ?? 'Failed to load transactions.'));
      }
    },
    [dispatch],
  );

  /** Append the next page (infinite scroll). */
  const fetchMoreTransactions = useCallback(
    async (address: string) => {
      if (!hasMore || isLoading) {
        return;
      }
      dispatch(setLoading(true));
      try {
        const nextPage = page + 1;
        const raw = await blockchainApi.getTransactions(
          address,
          nextPage,
          PAGE_SIZE,
        );
        dispatch(appendTransactions(raw.map(tx => mapTx(tx, address))));
        dispatch(incrementPage());
        dispatch(setHasMore(raw.length === PAGE_SIZE));
      } catch {
        // Silent fail — keep existing data visible
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, hasMore, isLoading, page],
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
    fetchTransactions,
    fetchMoreTransactions,
  };
};
