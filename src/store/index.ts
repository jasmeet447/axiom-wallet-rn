// ─── Store & root types ───────────────────────────────────────────────────────
export { store } from './store';
export type { RootState, AppDispatch, AppStore } from './store';

// ─── Typed hooks ─────────────────────────────────────────────────────────────
export { useAppDispatch, useAppSelector, useAppStore } from './hooks';

// ─── Auth slice ───────────────────────────────────────────────────────────────
export type { User, AuthState, AuthError } from './slices/authSlice';
export { AUTH_INITIAL_STATE } from './slices/authSlice';
export {
  setUser,
  setAuthenticated,
  setUnlocked,
  clearUser,
  setLoading as setAuthLoading,
  setError as setAuthError,
  clearError as clearAuthError,
  setBiometricEnabled,
  setInitialised,
  resetAuthState,
} from './slices/authSlice';

// ─── Wallet slice ─────────────────────────────────────────────────────────────
export type {
  Token,
  NetworkType,
  WalletData,
  WalletState,
  ManagedWallet,
} from './slices/walletSlice';
export { WALLET_INITIAL_STATE } from './slices/walletSlice';
export {
  addManagedWallet,
  removeManagedWallet,
  setManagedWallets,
  setActiveWallet,
  updateManagedWallet,
  setWallet,
  updateBalance,
  updateTokens,
  setLoading as setWalletLoading,
  setRefreshing,
  setError as setWalletError,
  clearError as clearWalletError,
  clearWallet,
  resetWalletState,
} from './slices/walletSlice';

// ─── Transactions slice ───────────────────────────────────────────────────────
export type {
  TxStatus,
  TxType,
  Transaction,
  TransactionsState,
} from './slices/transactionsSlice';
export { TRANSACTIONS_INITIAL_STATE } from './slices/transactionsSlice';
export {
  setTransactions,
  addTransaction,
  updateTransaction,
  appendTransactions,
  setLoading as setTxLoading,
  setError as setTxError,
  clearError as clearTxError,
  setHasMore,
  incrementPage,
  resetPagination,
  resetTransactionsState,
} from './slices/transactionsSlice';
