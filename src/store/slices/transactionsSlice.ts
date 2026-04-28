import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Domain types ────────────────────────────────────────────────────────────

export type TxStatus = 'pending' | 'confirmed' | 'failed';
export type TxType = 'send' | 'receive';

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  status: TxStatus;
  type: TxType;
  confirmations?: number;
  gasUsed?: string;
  gasPrice?: string;
}

// ─── State shape ─────────────────────────────────────────────────────────────

export interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  /** Whether the remote list has more pages to load */
  hasMore: boolean;
  /** Zero-indexed current page for pagination */
  page: number;
}

export const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 0,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: TRANSACTIONS_INITIAL_STATE,
  reducers: {
    /** Replace the full list (first page / hard refresh) */
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    /** Prepend a newly broadcast transaction */
    addTransaction(state, action: PayloadAction<Transaction>) {
      // Avoid duplicates if the tx already arrived via polling
      const exists = state.transactions.some(tx => tx.id === action.payload.id);
      if (!exists) {
        state.transactions.unshift(action.payload);
      }
    },
    updateTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.transactions.findIndex(
        tx => tx.id === action.payload.id,
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    /** Append the next page without wiping existing entries */
    appendTransactions(state, action: PayloadAction<Transaction[]>) {
      const existingIds = new Set(state.transactions.map(tx => tx.id));
      const newItems = action.payload.filter(tx => !existingIds.has(tx.id));
      state.transactions.push(...newItems);
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError(state) {
      state.error = null;
    },
    setHasMore(state, action: PayloadAction<boolean>) {
      state.hasMore = action.payload;
    },
    incrementPage(state) {
      state.page += 1;
    },
    resetPagination(state) {
      state.page = 0;
      state.hasMore = true;
    },
    /** Full reset — used on log-out or wallet switch */
    resetState() {
      return TRANSACTIONS_INITIAL_STATE;
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  appendTransactions,
  setLoading,
  setError,
  clearError,
  setHasMore,
  incrementPage,
  resetPagination,
  resetState: resetTransactionsState,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
