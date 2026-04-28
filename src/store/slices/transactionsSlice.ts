import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'send' | 'receive';
  confirmations?: number;
  gasUsed?: string;
  gasPrice?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 0,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(
        tx => tx.id === action.payload.id,
      );
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    appendTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions.push(...action.payload);
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: state => {
      state.error = null;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    incrementPage: state => {
      state.page += 1;
    },
    resetPagination: state => {
      state.page = 0;
      state.hasMore = true;
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
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
