import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ManagedWallet } from '../../core/api/wdkService';

// ─── Domain types ────────────────────────────────────────────────────────────

export type { ManagedWallet };

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
  /** The currently active (displayed) wallet's on-chain data. */
  wallet: WalletData | null;
  /** List of all managed wallets (metadata only, no secrets). */
  wallets: ManagedWallet[];
  /** ID of the wallet currently selected by the user. */
  activeWalletId: string | null;
  isLoading: boolean;
  error: string | null;
  /** True while a pull-to-refresh is in flight */
  refreshing: boolean;
  /** Timestamp (ms) of the last successful balance fetch */
  lastUpdatedAt: number | null;
}

export const WALLET_INITIAL_STATE: WalletState = {
  wallet: null,
  wallets: [],
  activeWalletId: null,
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
    // ── Multi-wallet management ──────────────────────────────────────────────

    /** Register a newly created / imported wallet in the list. */
    addManagedWallet(state, action: PayloadAction<ManagedWallet>) {
      const exists = state.wallets.some(w => w.id === action.payload.id);
      if (!exists) {
        state.wallets.push(action.payload);
      }
      // Auto-select if it's the first wallet
      if (!state.activeWalletId) {
        state.activeWalletId = action.payload.id;
      }
    },

    /** Remove a wallet from the list (after wiping it from keychain). */
    removeManagedWallet(state, action: PayloadAction<string>) {
      state.wallets = state.wallets.filter(w => w.id !== action.payload);
      if (state.activeWalletId === action.payload) {
        state.activeWalletId = state.wallets[0]?.id ?? null;
        state.wallet = null;
      }
    },

    /** Replace all managed wallets (used on bootstrap from keychain registry). */
    setManagedWallets(state, action: PayloadAction<ManagedWallet[]>) {
      state.wallets = action.payload;
      if (
        action.payload.length > 0 &&
        (!state.activeWalletId ||
          !action.payload.find(w => w.id === state.activeWalletId))
      ) {
        state.activeWalletId = action.payload[0].id;
      }
    },

    /** Patch fields on an existing managed wallet (e.g. populate address after unlock). */
    updateManagedWallet(
      state,
      action: PayloadAction<Partial<ManagedWallet> & { id: string }>,
    ) {
      const idx = state.wallets.findIndex(w => w.id === action.payload.id);
      if (idx !== -1) {
        state.wallets[idx] = { ...state.wallets[idx], ...action.payload };
      }
    },

    /** Switch the active wallet. Clears on-chain data so it can be re-fetched. */
    setActiveWallet(state, action: PayloadAction<string>) {
      state.activeWalletId = action.payload;
      state.wallet = null;
      state.error = null;
      state.lastUpdatedAt = null;
    },

    // ── On-chain data ────────────────────────────────────────────────────────

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
  addManagedWallet,
  removeManagedWallet,
  setManagedWallets,
  setActiveWallet,
  updateManagedWallet,
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
