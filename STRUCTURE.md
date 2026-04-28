# AxiomWallet - Folder Structure Documentation

## Overview

This document describes the scalable feature-based folder structure for the AxiomWallet React Native application.

**Note**: This project uses **direct imports** - all imports point directly to source files without barrel exports (index.ts files).

## Folder Structure

```
src/
├── app/                      # Application configuration
│   ├── App.tsx              # Main App component with providers
│   ├── navigation/          # Navigation configuration
│   │   ├── RootNavigator.tsx    # Root navigation logic
│   │   ├── AuthNavigator.tsx    # Authentication navigation
│   │   └── MainNavigator.tsx    # Main app navigation
│   └── providers/           # App-level context providers
│       └── AppProviders.tsx
│
├── store/                   # Redux store configuration
│   ├── store.ts            # Store configuration
│   ├── hooks.ts            # Typed Redux hooks
│   └── slices/             # Redux Toolkit slices
│       ├── authSlice.ts        # Authentication state
│       ├── walletSlice.ts      # Wallet state
│       └── transactionsSlice.ts # Transactions state
│
├── core/                    # Core utilities and services
│   ├── api/                # API clients
│   │   ├── apiClient.ts        # Base API client (Axios)
│   │   └── blockchainApi.ts    # Blockchain-specific API
│   ├── storage/            # Local storage utilities
│   │   └── storage.ts          # AsyncStorage wrapper
│   ├── biometric/          # Biometric authentication
│   │   └── biometricService.ts # Keychain/biometric service
│   └── utils/              # Utility functions
│       ├── helpers.ts          # General helpers
│       └── errors.ts           # Error handling
│
├── modules/                # Feature modules
│   ├── auth/              # Authentication module
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SetupScreen.tsx
│   │   ├── components/    # Auth-specific components
│   │   └── hooks/
│   │       └── useAuth.ts
│   │
│   ├── wallet/            # Wallet module
│   │   ├── screens/
│   │   │   └── WalletScreen.tsx
│   │   ├── components/    # Wallet-specific components
│   │   └── hooks/
│   │       └── useWallet.ts
│   │
│   ├── send/              # Send transaction module
│   │   ├── screens/
│   │   │   └── SendScreen.tsx
│   │   ├── components/    # Send-specific components
│   │   └── hooks/
│   │
│   ├── receive/           # Receive transaction module
│   │   ├── screens/
│   │   │   └── ReceiveScreen.tsx
│   │   ├── components/    # Receive-specific components
│   │   └── hooks/
│   │
│   └── transactions/      # Transaction history module
│       ├── screens/
│       │   └── TransactionsScreen.tsx
│       ├── components/    # Transaction-specific components
│       └── hooks/
│           └── useTransactions.ts
│
├── shared/                # Shared/reusable components
│   └── components/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── ErrorView.tsx
│       └── Card.tsx
│
└── theme/                 # Theme and styling
    ├── colors.ts          # Color palette + theme object
    └── spacing.ts         # Spacing, typography, shadows

```

## Architecture Principles

### 1. Feature-Based Modules

Each feature (auth, wallet, send, receive, transactions) is self-contained with:

- **screens/**: Feature-specific screen components
- **components/**: Feature-specific reusable components
- **hooks/**: Feature-specific custom hooks

### 2. Centralized State Management

- Redux Toolkit for global state
- Organized by domain (auth, wallet, transactions)
- Typed hooks for type safety

### 3. Core Services Layer

Shared services used across features:

- **api/**: API communication (Axios-based)
- **storage/**: Local data persistence (AsyncStorage)
- **biometric/**: Biometric authentication (Keychain)
- **utils/**: Helper functions and error handling

### 4. Shared Components

Reusable UI components used across multiple features:

- Button, Input, Loading, ErrorView, Card

### 5. Theme System

Centralized design tokens:

- Colors (light/dark mode support)
- Spacing, typography, shadows
- Easy to maintain and update

## Key Technologies

- **React Native** 0.85.2
- **Redux Toolkit** 2.11.2 - State management
- **React Navigation** 7.x - Navigation
- **React Native Keychain** 10.0.0 - Biometric & secure storage
- **Axios** - API client
- **AsyncStorage** - Local storage (needs installation)
- **Tether WDK** - Wallet development kit

## Getting Started

### Install Missing Dependencies

```bash
npm install @react-native-async-storage/async-storage
```

### Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Module Guidelines

### Creating a New Module

1. Create the module folder structure:

```
src/modules/new-feature/
├── screens/
├── components/
└── hooks/
```

2. Add necessary Redux slice in `src/store/slices/`

3. Update navigation in `src/app/navigation/`

### Adding Shared Components

Place reusable components in `src/shared/components/` as individual files. Import them directly by file name.

### Using Core Services

Import directly from core module files:

```typescript
import { api, apiClient } from '../../../core/api/apiClient';
import { blockchainApi } from '../../../core/api/blockchainApi';
import { storage, STORAGE_KEYS } from '../../../core/storage/storage';
import { biometricService } from '../../../core/biometric/biometricService';
```

### Import Examples

```typescript
// Navigation
import { RootNavigator } from './navigation/RootNavigator';
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';

// Hooks
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

// Components
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

// Theme
import { theme, colors } from '../../../theme/colors';
import { spacing, fontSize } from '../../../theme/spacing';

// Utils
import { formatAddress, formatBalance } from '../../../core/utils/helpers';
import { ERROR_MESSAGES, handleError } from '../../../core/utils/errors';
```

## Best Practices

1. **Direct Imports**: Always import directly from source files
2. **Type Safety**: Leverage TypeScript for all components and functions
3. **Component Composition**: Break down complex screens into smaller components
4. **State Management**: Use Redux for global state, local state for UI-only state
5. **Error Handling**: Use the error utilities from `core/utils/errors.ts`
6. **Styling**: Use theme constants for consistent design
7. **Explicit Dependencies**: Keep imports explicit for better IDE support and refactoring

## Next Steps

1. Install AsyncStorage dependency
2. Implement feature screens (currently placeholders)
3. Add feature-specific components
4. Integrate Tether WDK for blockchain functionality
5. Add tests for core utilities and Redux slices
6. Implement error boundaries
7. Add proper TypeScript types throughout

---

**Note**: This structure is designed to scale as the application grows. Each module is independent and can be developed, tested, and maintained separately.
