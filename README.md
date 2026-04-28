# Axiom Wallet

A secure, dark-themed React Native crypto wallet built with Redux Toolkit, Tether WDK cryptographic primitives, and system Keychain biometric protection.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Redux Usage](#redux-usage)
4. [Keychain & Biometric Approach](#keychain--biometric-approach)
5. [WDK Integration](#wdk-integration)
6. [App Flow](#app-flow)
7. [Challenges Faced](#challenges-faced)
8. [Setup](#setup)

---

## Architecture Overview

Axiom Wallet follows a **feature-module architecture** with a strict separation between UI, business logic, and infrastructure.

```
UI Layer        →  src/modules/**  (screens)
                   src/shared/components (reusable primitives)

State Layer     →  src/store/ (Redux slices, typed hooks)

Logic Layer     →  src/modules/**/hooks (React hooks over services)
                   src/core/api/ (wallet + blockchain services)
                   src/core/biometric/ (keychain / biometric service)

Infrastructure  →  react-native-keychain (secrets)
                   @scure/bip39, @scure/bip32 (BIP cryptography)
                   @noble/curves, @noble/hashes (EVM signing)
                   axios (HTTP / blockchain relay)
```

**Key design constraints:**

- Secrets (mnemonics, private keys) **never enter Redux, AsyncStorage, or the network**. They live exclusively in the OS Keychain with biometric access control.
- Private keys are derived on-device, used to sign a transaction, and immediately zeroed in memory (`privKey.fill(0)`).
- The app re-locks after 30 seconds in the background via `AppState` monitoring (`useAppLock`).

---

## Folder Structure

```
src/
├── app/
│   ├── App.tsx                     # Root component
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Auth gate (initialised / locked / unlocked)
│   │   ├── AuthNavigator.tsx       # Onboarding stack (Setup → Create / Import)
│   │   └── MainNavigator.tsx       # Bottom tab navigator (Home, Send, Receive, History)
│   └── providers/
│       ├── AppProviders.tsx        # Compose providers; mounts useAppLock
│       └── WdkProvider.tsx         # Bootstrap: read Keychain registry → populate Redux
│
├── constants/
│   └── strings/                    # All UI copy, by feature (auth, wallet, send, …)
│
├── core/
│   ├── api/
│   │   ├── apiClient.ts            # Axios instance + interceptors
│   │   ├── blockchainApi.ts        # Balance, nonce fetch, broadcastRawTx
│   │   ├── walletStorageService.ts # Per-wallet Keychain CRUD (biometric-protected)
│   │   └── wdkService.ts           # Wallet lifecycle: create, import, sign & send
│   ├── biometric/
│   │   └── biometricService.ts     # Device biometric check + legacy credential helpers
│   ├── storage/
│   │   └── storage.ts              # AsyncStorage wrapper (non-sensitive prefs only)
│   └── utils/
│       ├── evmSigner.ts            # On-device EIP-155 tx signer (RLP + secp256k1)
│       └── formatters.ts           # truncateAddress, formatETHBalance, calcFeeETH, …
│
├── modules/
│   ├── auth/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts          # Login / logout (wipes Keychain + Redux)
│   │   │   ├── useBiometricAuth.ts # Biometric unlock → populate address in Redux
│   │   │   └── useAppLock.ts       # Background re-lock after 30 s
│   │   └── screens/
│   │       ├── SetupScreen.tsx
│   │       ├── CreateWalletScreen.tsx
│   │       ├── ImportWalletScreen.tsx
│   │       └── UnlockScreen.tsx
│   ├── wallet/
│   │   ├── hooks/useWdkWallet.ts   # Central wallet lifecycle hook
│   │   └── screens/WalletScreen.tsx
│   ├── send/screens/SendScreen.tsx
│   ├── receive/screens/ReceiveScreen.tsx
│   └── transactions/screens/TransactionsScreen.tsx
│
├── shared/
│   └── components/                 # Button, Card, Input, SkeletonLoader,
│                                   # AppIconCircle, ScreenHeader, ErrorBanner
│
├── store/
│   ├── store.ts
│   ├── hooks.ts                    # useAppDispatch / useAppSelector
│   ├── index.ts                    # Barrel — re-exports all actions + types
│   └── slices/
│       ├── authSlice.ts
│       ├── walletSlice.ts
│       └── transactionsSlice.ts
│
└── theme/
    ├── colors.ts                   # darkPalette (single source of colour truth)
    ├── typography.ts               # Text-style tokens (h1–h3, body, mono, …)
    ├── spacing.ts
    └── index.ts
```

---

## Redux Usage

Three slices, each with a single responsibility:

| Slice               | Owns                                                                                    | Notable actions                                           |
| ------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `authSlice`         | Session state: `isAuthenticated`, `isUnlocked`, `isInitialised`, `biometricEnabled`     | `setUnlocked`, `setAuthenticated`, `resetAuthState`       |
| `walletSlice`       | Wallet metadata list (`ManagedWallet[]`), active wallet ID, on-chain balance/token data | `addManagedWallet`, `setActiveWallet`, `updateBalance`    |
| `transactionsSlice` | Transaction list, pagination (`page`, `hasMore`), loading/error state                   | `setTransactions`, `appendTransactions`, `addTransaction` |

**What Redux never stores:**

- Mnemonics or private keys (Keychain only)
- Auth tokens (Keychain only)
- PIN codes (Keychain only)

`WdkProvider` reads the Keychain registry on boot (no biometric prompt) and populates `walletSlice` with wallet metadata. The EVM address is empty until the user passes biometrics, at which point `useBiometricAuth` fills it in via `updateManagedWallet`.

---

## Keychain & Biometric Approach

All sensitive material uses `react-native-keychain` with:

```
accessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY
accessControl: BIOMETRY_CURRENT_SET
```

### Storage layout

| Keychain service key              | Content                             | Biometric protected   |
| --------------------------------- | ----------------------------------- | --------------------- |
| `AxiomWallet_mnemonic_<walletId>` | 12/24-word BIP-39 mnemonic          | ✅                    |
| `AxiomWallet_walletRegistry`      | JSON array of registered wallet IDs | ❌ (enumeration only) |
| `AxiomWallet_Meta`                | Existence flag (`"exists"`)         | ❌                    |
| `AxiomWallet`                     | Legacy biometric credential         | ✅                    |

### Unlock flow

1. **App start** — `WdkProvider` reads the plain registry (no prompt) → sets `isAuthenticated`.
2. **RootNavigator** routes to `UnlockScreen` because `!isUnlocked`.
3. `useBiometricAuth.unlock()` calls `walletStorageService.retrieveMnemonic(walletId)` → OS biometric prompt appears.
4. On success: mnemonic is used to derive the EVM address in memory → `setUnlocked(true)` dispatched → user sees the main app.
5. **Background re-lock**: `useAppLock` monitors `AppState`; if the app is backgrounded ≥ 30 s, `setUnlocked(false)` is dispatched → `RootNavigator` routes back to `UnlockScreen`.

### Send flow (private key lifecycle)

```
┌─ handleSend ──────────────────────────────────────────────────────────┐
│  wdkService.signAndSendTransaction(walletId, to, amount, gas)         │
│    1. retrieveMnemonic(walletId)  ← OS biometric prompt               │
│    2. bip39.mnemonicToSeedSync + HDKey.derive  → privKey              │
│    3. evmSigner.signEvmTransaction(params, privKey)                   │
│         RLP-encode pre-image → keccak256 → secp256k1.sign             │
│         extract r, s, recovery from 65-byte output                   │
│         re-encode signed tx as RLP                                    │
│    4. privKey.fill(0)  ← zero key regardless of success/error         │
│    5. blockchainApi.broadcastRawTx(rawTx)  ← ONLY signed bytes sent  │
└───────────────────────────────────────────────────────────────────────┘
```

---

## WDK Integration

The app uses **Tether WDK cryptographic primitives** directly on the main thread rather than compiling a worklet bundle (the documented fallback when `wdk-worklet-bundler` is not used):

| WDK/scure component        | Usage                                                                       |
| -------------------------- | --------------------------------------------------------------------------- |
| `@scure/bip39`             | Mnemonic generation (128-bit entropy) and strict BIP-39 wordlist validation |
| `@scure/bip32` + `HDKey`   | BIP-44 key derivation: `m/44'/60'/0'/0/0`                                   |
| `@noble/curves/secp256k1`  | ECDSA signing of EVM transaction pre-images                                 |
| `@noble/hashes/keccak_256` | EVM address derivation from public key; tx hash computation                 |

`wdkService.ts` orchestrates the full wallet lifecycle and is the **only** file that touches raw key material.

---

## App Flow

```
Cold start
│
├─ WdkProvider bootstraps
│    ├─ Keychain registry empty  →  SetupScreen → CreateWallet / ImportWallet
│    └─ Registry has wallets     →  UnlockScreen (biometric prompt auto-fires)
│
Authenticated + Unlocked
│
├─ MainNavigator (bottom tabs)
│    ├─ Home (WalletScreen)      — balance, quick-action buttons
│    ├─ Send (SendScreen)        — 3-step flow: Address → Amount → Confirm
│    │                              on Confirm: biometric → sign → broadcast
│    ├─ Receive (ReceiveScreen)  — QR code + copy address
│    └─ History (TransactionsScreen) — paginated tx list, filter by type/status
│
Background ≥ 30 s  →  isUnlocked = false  →  UnlockScreen
│
Logout  →  deleteAllMnemonics() + deleteWallet()  →  SetupScreen
```

---

## Challenges Faced

### 1 · WDK worklet-bundler requirement

The `@tetherto/wdk-react-native-core` library expects a pre-compiled Bare worklet bundle. Running without that CLI tool would have required a build-system change. **Solution**: use the same underlying `@scure` / `@noble` libraries directly on the main thread — the documented fallback path — keeping the full cryptographic fidelity without the bundler dependency.

### 2 · Private key never leaving the device

The initial API design passed a `privateKey` parameter to `blockchainApi.sendTransaction`. **Solution**: replaced with an on-device signing pipeline (`evmSigner.ts`) that only broadcasts pre-signed bytes. The private key is zeroed immediately in a `finally` block.

### 3 · `@noble/curves` v2 API change

v2.x `secp256k1.sign()` returns a compact `Uint8Array` rather than a `{ r, s, recovery }` object. **Solution**: use `{ format: 'recovered' }` to obtain the 65-byte output (`r[32] || s[32] || recovery[1]`), then slice accordingly.

### 4 · Biometric prompt timing

`walletStorageService.retrieveMnemonic` triggers the OS prompt internally. The challenge was threading the result back through Redux without temporarily holding the mnemonic in state. **Solution**: keep the mnemonic as a local variable only; immediately derive the address, dispatch `updateManagedWallet`, and let the mnemonic go out of scope.

### 5 · Orphaned old code after partial replacements

During the large-scale theme refactor, `replace_string_in_file` operations that targeted only the import/const section of files left the original component code appended after the new code. **Solution**: locate duplicate `export const` declarations, identify the exact cut line, and truncate via `head -n`.

### 6 · Skeleton / loading UX at scale

`ActivityIndicator` alone gives no shape context during balance and transaction list loading. **Solution**: introduced `WalletCardSkeleton` and `TransactionListSkeleton` using `Animated.loop` + `Animated.sequence` pulse animations that mirror the actual layout.

---

## Setup

### Prerequisites

- Node ≥ 22.11, Ruby 3.x, Xcode 15+, Android Studio (API 34+)

### Install

```bash
npm install
cd ios && bundle exec pod install && cd ..
```

### Run

```bash
# iOS
npm run ios

# Android
npm run android
```

### Test

```bash
npm test
```
