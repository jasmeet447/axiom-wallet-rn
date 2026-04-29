# Axiom Wallet — Product & Architecture Overview

> **Audience:** Stakeholders, product owners, and anyone who wants to understand what Axiom Wallet is, how it works, and the decisions made while building it — without needing a software background.

---

## What Is Axiom Wallet?

Axiom Wallet is a **mobile cryptocurrency wallet** for iOS and Android. It lets users:

- **Create or import** an Ethereum wallet using a seed phrase (a 12-word recovery key).
- **Send and receive ETH** using wallet addresses or QR codes.
- **View transaction history** with status, amounts, and timestamps.
- **Unlock the app with Face ID / fingerprint** instead of a password.

The app is built with React Native, meaning a single codebase runs natively on both iOS and Android.

---

## Architecture Overview

The app is organized in four distinct layers, each with a clear job:

```
┌──────────────────────────────────────────────────────────┐
│  UI Layer       What the user sees and taps              │
│  (Screens + Shared Components)                           │
├──────────────────────────────────────────────────────────┤
│  State Layer    The app's memory while it is running     │
│  (Redux Store)                                           │
├──────────────────────────────────────────────────────────┤
│  Logic Layer    Business rules, crypto operations        │
│  (Hooks + Core Services)                                 │
├──────────────────────────────────────────────────────────┤
│  Infrastructure Third-party libraries & device APIs      │
│  (Keychain, BIP-39/32, secp256k1, Axios)                 │
└──────────────────────────────────────────────────────────┘
```

**Why layers matter:** Each layer only talks to the layer directly below it. A screen never touches a cryptographic library directly. This makes the app easier to test, audit, and change safely.

**Key security principle:** Sensitive data (seed phrases, private keys) **never** touches the upper layers. They are created and used deep in the Logic layer, then immediately discarded — they are never stored in the app's in-memory state or sent over the internet.

---

## Folder Structure

Think of the codebase like a well-organized office building — each department has its own floor and only the right people have access.

```
src/
│
├── app/                  Entry point, navigation, and startup logic
│   ├── navigation/       Manages which screen is shown (login, home, etc.)
│   └── providers/        Runs background services when the app starts
│
├── constants/            All text strings shown in the UI, organized by screen
│
├── core/                 The secure engine room — no UI lives here
│   ├── api/              Talks to the blockchain and manages wallet secrets
│   ├── biometric/        Handles Face ID / fingerprint checks
│   ├── config/           Network configuration (chain ID, RPC endpoints)
│   ├── storage/          Non-sensitive settings (preferences only)
│   └── utils/            Helpers: address formatting, transaction signing, etc.
│
├── modules/              One folder per feature
│   ├── auth/             Login, wallet creation, seed phrase import
│   ├── wallet/           Dashboard and balance display
│   ├── send/             The 3-step send flow
│   ├── receive/          QR code and address sharing
│   └── transactions/     Transaction history list
│
├── shared/               Reusable UI building blocks (buttons, cards, inputs, skeletons)
│
├── shims/                Compatibility shims for native library differences
│
├── store/                The app's central memory (Redux)
│
└── theme/                Colours, fonts, and spacing used across every screen
```

**Why this structure?** Each feature is self-contained. A developer working on the Send screen cannot accidentally break the Transactions screen because they live in separate folders with clear boundaries.

---

## Redux — The App's Memory

Whilst the app is open, information needs to be shared between screens. For example, the dashboard and the send screen both need to know the wallet's current balance. Redux is the single place that holds this shared information.

### What Redux stores

| Information                              | Example                                                        |
| ---------------------------------------- | -------------------------------------------------------------- |
| Is the user logged in?                   | `isAuthenticated: true`                                        |
| Has biometrics been passed this session? | `isUnlocked: true`                                             |
| Has the app been initialised before?     | `isInitialised: true`                                          |
| Which wallet is selected?                | `activeWalletId: "My Wallet"`                                  |
| Current ETH balance                      | `balance: "0.4821"`                                            |
| Transaction history                      | `[{ hash: "0xabc…", amount: "0.1 ETH", status: "confirmed" }]` |

### What Redux **never** stores

| Information                        | Where it actually lives                   |
| ---------------------------------- | ----------------------------------------- |
| Seed phrase (12-word recovery key) | Device Keychain, locked by biometrics     |
| Private key                        | Derived in memory, used once, then erased |
| Authentication tokens              | Device Keychain                           |
| PIN codes                          | Device Keychain                           |

This separation means that even if an attacker somehow read the app's in-memory state, they would find no secrets — only non-sensitive display data.

---

## Keychain & Biometric Protection

### What is the Keychain?

The **Keychain** is a secure, encrypted vault built into iOS and Android. It is separate from the app itself — the operating system (Apple or Google) manages and protects it. Even Axiom Wallet's own code cannot read a Keychain entry without the user first proving their identity via Face ID, Touch ID, or fingerprint.

### How Axiom Wallet uses it

Every wallet's seed phrase is stored in the Keychain with the following protections:

- **Device-only**: the secret can never be backed up to iCloud or Google Drive.
- **Biometric gate**: the OS will not release the secret unless the user passes Face ID / fingerprint at that exact moment.
- **Per-wallet isolation**: each wallet has its own Keychain slot, so compromising one cannot expose another.

A separate "registry" entry (with no secrets, only wallet names) is stored without a biometric gate so the app can show "you have 2 wallets" on start-up without prompting the user immediately.

### The unlock flow — step by step

```
1. App opens
      ↓
2. Read wallet registry (no biometric needed — just names)
      ↓
3. Show "Unlock" screen → automatically trigger Face ID / fingerprint
      ↓
4. OS releases the seed phrase to the app (in memory only, never saved)
      ↓
5. App derives the wallet address from the seed phrase
      ↓
6. Seed phrase is discarded — address displayed on screen
      ↓
7. User is inside the app
```

### Automatic re-lock

If the app is sent to the background (e.g. the user switches to another app) for **30 seconds or more**, it automatically locks itself. The next time the user returns, Face ID / fingerprint is required again.

---

## Sending Funds — Private Key Never Leaves the Device

This is the most security-critical part of the app, and the design is intentional.

### The old (insecure) approach ❌

Some wallets send the private key to a server, which then signs and broadcasts the transaction. This means the private key travels over the internet — a serious security risk.

### Axiom Wallet's approach ✅

```
1. User taps "Confirm & Send"
      ↓
2. Face ID / fingerprint prompt (OS releases seed phrase)
      ↓
3. Private key derived ON the device — never stored, never sent
      ↓
4. Transaction signed ON the device using the private key
      ↓
5. Private key erased from memory immediately
      ↓
6. Only the SIGNED transaction (like a sealed envelope) is sent to the network
      ↓
7. Network broadcasts it — the private key was never seen by anyone
```

The server only ever sees a pre-signed transaction — like receiving a signed cheque. It cannot alter it, and the signing key is never exposed.

---

## WDK Integration

WDK (Wallet Development Kit) is Tether's toolkit for building secure wallets. Axiom Wallet uses its underlying cryptographic building blocks:

| WDK Component                 | Plain-English Purpose                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| BIP-39 (seed phrase standard) | Generates the 12-word recovery key and validates imported ones                             |
| BIP-32/44 (key derivation)    | Derives the wallet's private key from the seed phrase following the industry-standard path |
| secp256k1 (signing algorithm) | Signs transactions using the Ethereum cryptographic standard                               |
| keccak-256 (hashing)          | Derives the wallet address from the public key                                             |

### Why not use WDK's full worklet runtime?

WDK normally runs inside a sandboxed background thread ("worklet") which requires a separate build step. For this project, we used the same underlying libraries directly on the main thread — the officially documented alternative — keeping identical security and cryptographic correctness without the additional build infrastructure.

---

## Challenges Faced

### 1. Keeping the private key off the internet

The initial integration used an API endpoint that accepted a private key server-side. This is a fundamental security flaw. We redesigned the send flow so that all cryptographic operations happen on-device and only the signed transaction is transmitted.

### 2. WDK build tooling

WDK's worklet bundler requires a specific compilation step. Bypassing this without compromising security required implementing the same BIP-39/32 operations directly using the same underlying libraries WDK uses internally.

### 3. Automatic session re-locking

Mobile apps can sit in the background for hours. Without a re-lock mechanism, a stolen unlocked phone would give permanent access. We implemented the 30-second background timer to address this.

### 4. Biometric cancellation UX

When a user cancels Face ID during a send, the app must not treat it as an error — it should simply stay on the confirm screen and allow a retry. Differentiating "cancelled" from a genuine failure required careful error handling.

### 5. Skeleton loading states

Waiting for a balance or transaction list to load with only a spinning circle is a poor experience. Custom skeleton screens were built that mirror the exact shape of the content, giving users a clear sense of what is loading and where.

### 6. API library version change

The cryptographic signing library (`@noble/curves`) changed its output format between major versions — from a structured object to a raw byte array. This was identified through testing and fixed with the correct byte-slicing approach.

---

## How the App Flow Looks to the User

```
First time opening the app
  └─ Welcome screen → Create new wallet  OR  Import existing wallet
       └─ Write down your 12-word seed phrase and confirm it
            └─ Wallet created — you're in

Every time after that
  └─ Face ID / fingerprint prompt
       ├─ Pass → Dashboard (balance + actions)
       │    ├─ Send → Enter address → Enter amount → Review → Biometrics → Done
       │    ├─ Receive → QR code + copy address
       │    └─ History → Full list of past transactions
       └─ Fail / Cancel → Try again
```

---

## Summary

Axiom Wallet demonstrates that a production-grade crypto wallet can be built with:

- **No private keys ever leaving the device** — all signing is local.
- **Biometric protection at every sensitive operation** — send, unlock, mnemonic reveal.
- **Automatic session expiry** — 30-second background lock.
- **Clean, layered code** — UI, state, logic, and infrastructure each in their own lane.
- **Industry-standard cryptography** — BIP-39, BIP-44, EIP-155, secp256k1 — the same standards used by MetaMask, Ledger, and Coinbase Wallet.
