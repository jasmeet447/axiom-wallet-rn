# AxiomWallet — Folder Structure

## Overview

Feature-based module architecture. Each domain (auth, wallet, send, receive, transactions) is self-contained with its own screens, hooks, and types. Shared UI primitives live in `src/shared/components`. Core services and cryptographic utilities live in `src/core`, completely separate from the UI.

Both **direct imports** (to specific source files) and **barrel imports** (via `index.ts`) are supported. The `store/`, `theme/`, `shared/components`, and `constants/strings` folders expose barrel exports for convenience.

---

## Folder Structure

```
src/
│
├── app/                              # Application entry, navigation, and startup
│   ├── App.tsx                       # Root component (wraps providers + navigator)
│   ├── navigation/
│   │   ├── RootNavigator.tsx         # Auth gate: routes between Auth/Main stacks
│   │   ├── AuthNavigator.tsx         # Onboarding stack (Setup → Create / Import)
│   │   └── MainNavigator.tsx         # Bottom-tab navigator (Home, Send, Receive, History)
│   └── providers/
│       ├── AppProviders.tsx          # Composes all providers; mounts useAppLock
│       └── WdkProvider.tsx           # Bootstrap: reads Keychain registry → populates Redux
│
├── constants/
│   └── strings/                      # All UI copy organised by feature
│       ├── auth.ts
│       ├── common.ts
│       ├── receive.ts
│       ├── send.ts
│       ├── transactions.ts
│       ├── wallet.ts
│       └── index.ts                  # Barrel re-export
│
├── core/                             # Secure engine room — no UI lives here
│   ├── api/
│   │   ├── apiClient.ts              # Axios instance + request/response interceptors
│   │   ├── blockchainApi.ts          # Balance, nonce, gas estimation, broadcastRawTx
│   │   ├── walletStorageService.ts   # Per-wallet Keychain CRUD (biometric-protected)
│   │   └── wdkService.ts             # Wallet lifecycle: create, import, sign & send
│   ├── biometric/
│   │   └── biometricService.ts       # Device biometric check + legacy credential helpers
│   ├── config/
│   │   ├── wdkConfig.ts              # WDK network config (chain ID, RPC, bundler URL)
│   │   └── wdkBundle.ts              # WDK worklet bundle reference (placeholder)
│   ├── storage/
│   │   └── storage.ts                # AsyncStorage wrapper for non-sensitive preferences
│   └── utils/
│       ├── evmSigner.ts              # On-device EIP-155 tx signer (RLP + secp256k1)
│       ├── formatters.ts             # truncateAddress, formatETHBalance, calcFeeETH, …
│       ├── helpers.ts                # General-purpose utility functions
│       └── errors.ts                 # Typed AppError class + error handler
│
├── modules/                          # One folder per product feature
│   ├── auth/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Login / logout (wipes Keychain + Redux)
│   │   │   ├── useBiometricAuth.ts   # Biometric unlock → derive address → populate Redux
│   │   │   └── useAppLock.ts         # AppState watcher — re-locks after 30 s background
│   │   └── screens/
│   │       ├── SetupScreen.tsx       # First-launch choice: Create or Import
│   │       ├── LoginScreen.tsx       # Auth entry point
│   │       ├── CreateWalletScreen.tsx # 3-step: generate → backup → confirm
│   │       ├── ImportWalletScreen.tsx # Seed-phrase import + validation
│   │       └── UnlockScreen.tsx      # Biometric unlock for returning users
│   │
│   ├── wallet/
│   │   ├── hooks/
│   │   │   ├── useWdkWallet.ts       # Central wallet lifecycle hook (create/import/send)
│   │   │   └── useWallet.ts          # Balance & transaction fetch hook
│   │   └── screens/
│   │       └── WalletScreen.tsx      # Dashboard: balance, actions, activity summary
│   │
│   ├── send/
│   │   └── screens/
│   │       └── SendScreen.tsx        # 3-step send flow: Address → Amount → Confirm
│   │
│   ├── receive/
│   │   └── screens/
│   │       └── ReceiveScreen.tsx     # QR code display + copy-address
│   │
│   └── transactions/
│       ├── hooks/
│       │   └── useTransactions.ts    # Paginated transaction history fetch
│       └── screens/
│           └── TransactionsScreen.tsx
│
├── shared/
│   └── components/                   # Reusable UI primitives
│       ├── AppIconCircle.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ErrorBanner.tsx
│       ├── ErrorView.tsx
│       ├── Input.tsx
│       ├── Loading.tsx
│       ├── ScreenHeader.tsx
│       ├── SkeletonLoader.tsx        # WalletCardSkeleton + TransactionListSkeleton
│       └── index.ts                  # Barrel re-export
│
├── shims/
│   └── expo-local-authentication.js  # Expo biometric API shim for native compatibility
│
├── store/
│   ├── store.ts                      # Redux store configuration (RTK configureStore)
│   ├── hooks.ts                      # useAppDispatch / useAppSelector / useAppStore
│   ├── index.ts                      # Barrel re-export: all actions, types, hooks
│   └── slices/
│       ├── authSlice.ts              # isAuthenticated, isUnlocked, isInitialised, biometricEnabled
│       ├── walletSlice.ts            # wallets[], activeWalletId, balance, tokens
│       └── transactionsSlice.ts      # transactions[], page, hasMore, loading, error
│
├── theme/
│   ├── colors.ts                     # darkPalette + theme object (single colour source of truth)
│   ├── typography.ts                 # Text-style tokens: h1–h3, body, mono, …
│   ├── spacing.ts                    # Spacing scale, borderRadius, fontSize, fontWeight, shadows
│   └── index.ts                      # Barrel re-export
│
└── globals.d.ts                      # Global TypeScript ambient declarations
```

---

## Architecture Principles

### 1. Feature-Based Modules

Each feature (`auth`, `wallet`, `send`, `receive`, `transactions`) is self-contained with its own screens, hooks, and types. A developer working on Send cannot accidentally break Transactions.

### 2. Core vs. Modules

`src/core/` contains infrastructure (API clients, storage, crypto utilities). **No UI renders inside `core/`**. Modules import from `core/` but `core/` never imports from `modules/`.

### 3. Secrets Never Touch Redux

Redux holds only display-safe metadata (wallet name, address, balance string). Mnemonics and private keys are created, used, and discarded inside `core/api/wdkService.ts`. They never pass through Redux slices or AsyncStorage.

### 4. Barrel Exports

The following directories expose an `index.ts` barrel for import convenience:

| Directory | Barrel exports |
|---|---|
| `src/store/` | Store, typed hooks, all slice actions + types |
| `src/theme/` | colors, typography, spacing tokens |
| `src/shared/components/` | All shared UI components |
| `src/constants/strings/` | All UI string constants |

Direct-to-file imports are always valid and may be preferred for clarity.

### 5. Dependency Direction

```
modules/**/screens
    ↓
modules/**/hooks
    ↓
core/api  ·  core/utils  ·  core/biometric  ·  core/storage
    ↓
Infrastructure: react-native-keychain, @scure/bip39, @scure/bip32,
                @noble/curves, @noble/hashes, axios
```

Each layer only imports from the layer directly below it.
