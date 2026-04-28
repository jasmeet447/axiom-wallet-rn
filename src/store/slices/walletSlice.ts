import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Domain types ────────────────────────────────────────────────────────────

export interface Token {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress?: string;
}

export type NetworkType = 'mainnet' | 'testnet';

export interface WalletData {
  address: string;
  balance: string;
  network: NetworkType;
  tokens: Token[];
}

// ─── State shape ─────────────────────────────────────────────────────────────

export interface WalletState {
  wallet: WalletData | null;
  isLoading: boolean;
  error: string | null;
  /** True while a pull-to-refresh is in flight */
  refreshing: boolean;
  /** Timestamp (ms) of the last successful balance fetch */
  lastUpdatedAt: number | null;
}

export const WALLET_INITIAL_STATE: WalletState = {
  wallet: null,
  isLoading: false,
  error: null,
  refreshing: false,
  lastUpdatedAt: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const walletSlice = createSlice({
  name: 'wallet',
  initialState: WALLET_INITIAL_STATE,
  reducers: {
    setWallet(state, action: PayloadAction<WalletData>) {
      state.wallet = action.payload;
      state.isLoading = false;
      state.error = null;
      state.lastUpdatedAt = Date.now();
    },
    updateBalance(state, action: PayloadAction<string>) {
      if (state.wallet) {
        state.wallet.balance = action.payload;
        state.lastUpdatedAt = Date.now();
      }
    },
    updateTokens(state, action: PayloadAction<Token[]>) {
      if (state.wallet) {
        state.wallet.tokens = action.payload;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setRefreshing(state, action: PayloadAction<boolean>) {
      state.refreshing = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
      state.refreshing = false;
    },
    clearError(state) {
      state.error = null;
    },
    /** Full reset — used on log-out */
    resetState() {
      return WALLET_INITIAL_STATE;
    },
    clearWallet(state) {
      state.wallet = null;
      state.error = null;
      state.lastUpdatedAt = null;
    },
  },
});

export const {
  setWallet,
  updateBalance,
  updateTokens,
  setLoading,
  setRefreshing,
  setError,
  clearError,
  clearWallet,
  resetState: resetWalletState,
} = walletSlice.actions;

export default walletSlice.reducer;
