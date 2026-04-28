import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import transactionsReducer from './slices/transactionsSlice';

const rootReducer = {
  auth: authReducer,
  wallet: walletReducer,
  transactions: transactionsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.user', 'wallet.wallet'],
      },
    }),
});

// Inferred types from the store — never manually written, always stays in sync
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
