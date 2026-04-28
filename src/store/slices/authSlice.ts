import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Domain types ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email?: string;
  isSetup: boolean;
}

export type AuthError = string | null;

// ─── State shape ─────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError;
  /** Whether the user has enabled biometric unlock */
  biometricEnabled: boolean;
  /** Whether the app has completed its initial auth check */
  isInitialised: boolean;
}

export const AUTH_INITIAL_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  isInitialised: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: AUTH_INITIAL_STATE,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
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
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.biometricEnabled = action.payload;
    },
    setInitialised(state, action: PayloadAction<boolean>) {
      state.isInitialised = action.payload;
    },
    /** Full reset — used on log-out */
    resetState() {
      return AUTH_INITIAL_STATE;
    },
  },
});

export const {
  setUser,
  clearUser,
  setLoading,
  setError,
  clearError,
  setBiometricEnabled,
  setInitialised,
  resetState: resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
