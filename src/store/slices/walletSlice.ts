import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletData {
  address: string;
  balance: string;
  network: 'mainnet' | 'testnet';
  tokens?: Token[];
}

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
}

interface WalletState {
  wallet: WalletData | null;
  isLoading: boolean;
  error: string | null;
  refreshing: boolean;
}

const initialState: WalletState = {
  wallet: null,
  isLoading: false,
  error: null,
  refreshing: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallet: (state, action: PayloadAction<WalletData>) => {
      state.wallet = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      if (state.wallet) {
        state.wallet.balance = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.refreshing = false;
    },
    clearError: state => {
      state.error = null;
    },
    clearWallet: state => {
      state.wallet = null;
      state.error = null;
    },
  },
});

export const {
  setWallet,
  updateBalance,
  setLoading,
  setRefreshing,
  setError,
  clearError,
  clearWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
