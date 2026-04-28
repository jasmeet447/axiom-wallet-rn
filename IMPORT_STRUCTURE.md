# Import Structure - Direct Imports

## Overview
This project uses **direct imports** instead of barrel exports (index.ts files). All imports point directly to the source files where components, functions, or types are defined.

## Import Patterns

### App Entry & Navigation

#### From root App.tsx
```typescript
import App from './src/app/App';
```

#### In src/app/App.tsx
```typescript
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';
import { store } from '../store/store';
import { theme } from '../theme/colors';
```

#### In Navigation Files
```typescript
// src/app/navigation/RootNavigator.tsx
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '../../modules/auth/hooks/useAuth';

// src/app/navigation/AuthNavigator.tsx
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { SetupScreen } from '../../modules/auth/screens/SetupScreen';

// src/app/navigation/MainNavigator.tsx
import { WalletScreen } from '../../modules/wallet/screens/WalletScreen';
import { SendScreen } from '../../modules/send/screens/SendScreen';
import { ReceiveScreen } from '../../modules/receive/screens/ReceiveScreen';
import { TransactionsScreen } from '../../modules/transactions/screens/TransactionsScreen';
```

### Store Imports

#### Store Configuration
```typescript
// From anywhere
import { store } from '../../../store/store';  // Adjust path levels as needed
```

#### Redux Hooks
```typescript
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
```

#### Redux Slices
```typescript
import { setUser, clearUser } from '../../../store/slices/authSlice';
import { setWallet, updateBalance } from '../../../store/slices/walletSlice';
import { setTransactions, addTransaction } from '../../../store/slices/transactionsSlice';
```

#### Types from Slices
```typescript
import type { User } from '../../../store/slices/authSlice';
import type { WalletData, Token } from '../../../store/slices/walletSlice';
import type { Transaction } from '../../../store/slices/transactionsSlice';
```

### Core Services Imports

#### API
```typescript
import { api, apiClient } from '../../../core/api/apiClient';
import { blockchainApi } from '../../../core/api/blockchainApi';
import type { BlockchainTransaction, WalletBalance } from '../../../core/api/blockchainApi';
```

#### Storage
```typescript
import { storage, STORAGE_KEYS } from '../../../core/storage/storage';
```

#### Biometric
```typescript
import { biometricService } from '../../../core/biometric/biometricService';
import type { BiometricCredentials } from '../../../core/biometric/biometricService';
```

#### Utils
```typescript
// helpers.ts
import {
  formatAddress,
  formatBalance,
  formatCurrency,
  formatDate,
  isValidAddress,
  isValidAmount,
  truncate,
  wait,
  debounce
} from '../../../core/utils/helpers';

// errors.ts
import { ERROR_MESSAGES, AppError, handleError } from '../../../core/utils/errors';
```

### Module Hooks Imports

```typescript
// Auth
import { useAuth } from '../../modules/auth/hooks/useAuth';

// Wallet
import { useWallet } from '../../modules/wallet/hooks/useWallet';

// Transactions
import { useTransactions } from '../../modules/transactions/hooks/useTransactions';
```

### Shared Components Imports

```typescript
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Loading } from '../../../shared/components/Loading';
import { ErrorView } from '../../../shared/components/ErrorView';
import { Card } from '../../../shared/components/Card';
```

### Theme Imports

```typescript
// Import the complete theme object
import { theme } from '../theme/colors';

// Or import specific parts
import { colors } from '../theme/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme/spacing';

// Types
import type { ColorScheme, Colors, Theme } from '../theme/colors';
```

## File Structure Reference

```
src/
├── app/
│   ├── App.tsx                           # Main app component
│   ├── navigation/
│   │   ├── RootNavigator.tsx            # Root navigator
│   │   ├── AuthNavigator.tsx            # Auth stack
│   │   └── MainNavigator.tsx            # Main stack
│   └── providers/
│       └── AppProviders.tsx             # Context providers
│
├── store/
│   ├── store.ts                          # Redux store config
│   ├── hooks.ts                          # Typed hooks
│   └── slices/
│       ├── authSlice.ts
│       ├── walletSlice.ts
│       └── transactionsSlice.ts
│
├── core/
│   ├── api/
│   │   ├── apiClient.ts                 # Axios client
│   │   └── blockchainApi.ts             # Blockchain API
│   ├── storage/
│   │   └── storage.ts                   # AsyncStorage wrapper
│   ├── biometric/
│   │   └── biometricService.ts          # Keychain/biometric
│   └── utils/
│       ├── helpers.ts                   # Helper functions
│       └── errors.ts                    # Error handling
│
├── modules/
│   ├── auth/
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SetupScreen.tsx
│   │   ├── components/
│   │   └── hooks/
│   │       └── useAuth.ts
│   ├── wallet/
│   │   ├── screens/
│   │   │   └── WalletScreen.tsx
│   │   ├── components/
│   │   └── hooks/
│   │       └── useWallet.ts
│   ├── send/
│   │   ├── screens/
│   │   │   └── SendScreen.tsx
│   │   ├── components/
│   │   └── hooks/
│   ├── receive/
│   │   ├── screens/
│   │   │   └── ReceiveScreen.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── transactions/
│       ├── screens/
│       │   └── TransactionsScreen.tsx
│       ├── components/
│       └── hooks/
│           └── useTransactions.ts
│
├── shared/
│   └── components/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── ErrorView.tsx
│       └── Card.tsx
│
└── theme/
    ├── colors.ts                         # Colors + theme object
    └── spacing.ts                        # Spacing, fonts, shadows
```

## Benefits of Direct Imports

1. **Explicit Dependencies** - Easy to see exactly where each import comes from
2. **Better IDE Support** - Auto-complete works more reliably
3. **Easier Refactoring** - Moving files doesn't break barrel exports
4. **Simpler Structure** - No need to maintain index.ts files
5. **Clear Module Boundaries** - Direct paths make dependencies obvious
6. **Better Tree Shaking** - Bundlers can optimize better without barrel exports

## Migration from Barrel Exports

If you had code using barrel exports:

```typescript
// ❌ Old (with barrel exports via index.ts)
import { LoginScreen, SetupScreen } from '../../modules/auth/screens';
import { useAuth } from '../../modules/auth/hooks';
import { Button, Input } from '../../../shared/components';

// ✅ New (direct imports)
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { SetupScreen } from '../../modules/auth/screens/SetupScreen';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
```

## Path Reference by Location

### From `src/app/App.tsx`:
- Providers: `./providers/AppProviders`
- Navigation: `./navigation/RootNavigator`
- Store: `../store/store`
- Theme: `../theme/colors`

### From `src/app/navigation/*.tsx`:
- Modules: `../../modules/{module}/{type}/{FileName}`
- Example: `../../modules/auth/screens/LoginScreen`

### From `src/modules/{module}/hooks/*.ts`:
- Store: `../../../store/hooks` or `../../../store/slices/{slice}`
- Core: `../../../core/{service}/{file}`

### From `src/modules/{module}/screens/*.tsx`:
- Hooks: `../hooks/{hookName}`
- Shared Components: `../../../shared/components/{ComponentName}`
- Theme: `../../../theme/colors`
