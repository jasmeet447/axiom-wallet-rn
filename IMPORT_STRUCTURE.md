# Import Structure

## Overview

This project supports two import styles:

- **Direct imports** — point straight to the source file. Always safe, always explicit.
- **Barrel imports** — use the `index.ts` in `store/`, `theme/`, `shared/components/`, and `constants/strings/`. Convenient for consumers that need multiple exports from one domain.

```typescript
// ✅ Direct import
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';

// ✅ Barrel import (also valid)
import { Button, Card, Input } from '../../../shared/components';
import { setUnlocked, walletSlice } from '../../../store';
```

---

## Import Patterns

### App Entry & Navigation

```typescript
// root index.js
import App from './src/app/App';

// src/app/App.tsx
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';
import { store } from '../store/store';
import { theme } from '../theme/colors';

// src/app/providers/AppProviders.tsx
import { WdkProvider } from './WdkProvider';

// src/app/navigation/RootNavigator.tsx
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '../../modules/auth/hooks/useAuth';

// src/app/navigation/AuthNavigator.tsx
import { SetupScreen } from '../../modules/auth/screens/SetupScreen';
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { CreateWalletScreen } from '../../modules/auth/screens/CreateWalletScreen';
import { ImportWalletScreen } from '../../modules/auth/screens/ImportWalletScreen';

// src/app/navigation/MainNavigator.tsx
import { WalletScreen } from '../../modules/wallet/screens/WalletScreen';
import { SendScreen } from '../../modules/send/screens/SendScreen';
import { ReceiveScreen } from '../../modules/receive/screens/ReceiveScreen';
import { TransactionsScreen } from '../../modules/transactions/screens/TransactionsScreen';
```

### Store Imports

```typescript
// Direct — store configuration
import { store } from '../../../store/store';
import type { RootState, AppDispatch, AppStore } from '../../../store/store';

// Direct — typed hooks
import { useAppDispatch, useAppSelector, useAppStore } from '../../../store/hooks';

// Direct — slices
import { setUnlocked, setAuthenticated, resetAuthState } from '../../../store/slices/authSlice';
import { addManagedWallet, setActiveWallet, updateBalance } from '../../../store/slices/walletSlice';
import { setTransactions, appendTransactions, addTransaction } from '../../../store/slices/transactionsSlice';

// Barrel — everything from one import
import {
  store,
  useAppDispatch,
  useAppSelector,
  setUnlocked,
  setAuthenticated,
  addManagedWallet,
  setActiveWallet,
  setTransactions,
} from '../../../store';
import type { RootState, AppDispatch, ManagedWallet, Transaction } from '../../../store';
```

### Core Services Imports

```typescript
// API client
import { apiClient } from '../../../core/api/apiClient';
import { blockchainApi } from '../../../core/api/blockchainApi';
import type { BlockchainTransaction, WalletBalance } from '../../../core/api/blockchainApi';

// Wallet storage (Keychain)
import { walletStorageService } from '../../../core/api/walletStorageService';

// WDK service (wallet lifecycle + signing)
import { wdkService } from '../../../core/api/wdkService';

// Biometric
import { biometricService } from '../../../core/biometric/biometricService';

// WDK config
import { wdkConfigs, ETH_ASSET } from '../../../core/config/wdkConfig';

// Storage (AsyncStorage wrapper)
import { storage, STORAGE_KEYS } from '../../../core/storage/storage';

// Utils
import { signEvmTransaction } from '../../../core/utils/evmSigner';
import {
  truncateAddress,
  formatETHBalance,
  calcFeeETH,
  isValidEVMAddress,
} from '../../../core/utils/formatters';
import { debounce, wait } from '../../../core/utils/helpers';
import { AppError, handleError } from '../../../core/utils/errors';
```

### Module Hooks Imports

```typescript
// Auth
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { useBiometricAuth } from '../../modules/auth/hooks/useBiometricAuth';
import { useAppLock } from '../../modules/auth/hooks/useAppLock';

// Wallet
import { useWdkWallet } from '../../modules/wallet/hooks/useWdkWallet';
import { useWallet } from '../../modules/wallet/hooks/useWallet';

// Transactions
import { useTransactions } from '../../modules/transactions/hooks/useTransactions';
```

### Shared Components Imports

```typescript
// Direct imports
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Loading } from '../../../shared/components/Loading';
import { ErrorView } from '../../../shared/components/ErrorView';
import { ErrorBanner } from '../../../shared/components/ErrorBanner';
import { AppIconCircle } from '../../../shared/components/AppIconCircle';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import {
  SkeletonBlock,
  WalletCardSkeleton,
  TransactionListSkeleton,
} from '../../../shared/components/SkeletonLoader';

// Barrel import (also valid)
import {
  Button,
  Card,
  Input,
  Loading,
  ErrorView,
  ErrorBanner,
  AppIconCircle,
  ScreenHeader,
  WalletCardSkeleton,
  TransactionListSkeleton,
} from '../../../shared/components';
```

### Theme Imports

```typescript
// Direct imports
import { colors, darkPalette, theme } from '../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { ColorScheme, Colors, Theme } from '../theme/colors';

// Barrel import
import { colors, typography, spacing, borderRadius, theme } from '../theme';
```

### String Constants Imports

```typescript
// Direct imports
import { AUTH_STRINGS } from '../../../constants/strings/auth';
import { COMMON_STRINGS } from '../../../constants/strings/common';
import { SEND_STRINGS } from '../../../constants/strings/send';
import { RECEIVE_STRINGS } from '../../../constants/strings/receive';
import { WALLET_STRINGS } from '../../../constants/strings/wallet';
import { TRANSACTIONS_STRINGS } from '../../../constants/strings/transactions';

// Barrel import
import { AUTH_STRINGS, SEND_STRINGS, WALLET_STRINGS } from '../../../constants/strings';
```

---

## File Structure Reference

```
src/
├── app/
│   ├── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   └── providers/
│       ├── AppProviders.tsx
│       └── WdkProvider.tsx
│
├── constants/
│   └── strings/
│       ├── auth.ts
│       ├── common.ts
│       ├── receive.ts
│       ├── send.ts
│       ├── transactions.ts
│       ├── wallet.ts
│       └── index.ts           ← barrel
│
├── core/
│   ├── api/
│   │   ├── apiClient.ts
│   │   ├── blockchainApi.ts
│   │   ├── walletStorageService.ts
│   │   └── wdkService.ts
│   ├── biometric/
│   │   └── biometricService.ts
│   ├── config/
│   │   ├── wdkConfig.ts
│   │   └── wdkBundle.ts
│   ├── storage/
│   │   └── storage.ts
│   └── utils/
│       ├── evmSigner.ts
│       ├── formatters.ts
│       ├── helpers.ts
│       └── errors.ts
│
├── modules/
│   ├── auth/
│   │   ├── screens/
│   │   │   ├── SetupScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── CreateWalletScreen.tsx
│   │   │   ├── ImportWalletScreen.tsx
│   │   │   └── UnlockScreen.tsx
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useBiometricAuth.ts
│   │       └── useAppLock.ts
│   ├── wallet/
│   │   ├── screens/
│   │   │   └── WalletScreen.tsx
│   │   └── hooks/
│   │       ├── useWdkWallet.ts
│   │       └── useWallet.ts
│   ├── send/
│   │   └── screens/
│   │       └── SendScreen.tsx
│   ├── receive/
│   │   └── screens/
│   │       └── ReceiveScreen.tsx
│   └── transactions/
│       ├── screens/
│       │   └── TransactionsScreen.tsx
│       └── hooks/
│           └── useTransactions.ts
│
├── shared/
│   └── components/
│       ├── AppIconCircle.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ErrorBanner.tsx
│       ├── ErrorView.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── ScreenHeader.tsx
│       ├── SkeletonLoader.tsx
│       └── index.ts           ← barrel
│
├── shims/
│   └── expo-local-authentication.js
│
├── store/
│   ├── store.ts
│   ├── hooks.ts
│   ├── index.ts               ← barrel
│   └── slices/
│       ├── authSlice.ts
│       ├── walletSlice.ts
│       └── transactionsSlice.ts
│
└── theme/
    ├── colors.ts
    ├── typography.ts
    ├── spacing.ts
    └── index.ts               ← barrel
```
