# Axiom Wallet — Demo Script

> **Format:** Live app walkthrough + narration  
> **Audience:** Tether / technical reviewers  
> **Duration:** ~10 minutes  
> **Device:** iOS simulator or physical device with Face ID enabled

---

## 0 · Opening (30 seconds)

> _"Axiom Wallet is a React Native crypto wallet built to submission-grade standards — secure by design, not by accident. Every architectural decision prioritises one thing: sensitive key material never leaves the device and never touches Redux or the network._
>
> _In the next 10 minutes I'll walk through the architecture, then demonstrate the four core flows: create wallet, unlock, send, and receive. I'll call out the key engineering decisions as we go."_

---

## 1 · Architecture Overview (90 seconds)

> _"Before I open the app, a quick 30-second map of how it's structured."_

**Say:**

The codebase is split into four layers:

- **UI Layer** — screens and shared components. Thin. No business logic.
- **State Layer** — Redux Toolkit. Holds display data only. Secrets are explicitly banned here.
- **Logic Layer** — hooks wrap core services. `wdkService`, `walletStorageService`, `biometricService`. This is where crypto operations happen.
- **Infrastructure** — `react-native-keychain`, `@scure/bip39`, `@scure/bip32`, `@noble/curves`. No UI, no Redux. Pure capability.

> _"The rule is simple: each layer only talks to the layer directly below it. A screen never imports a crypto library. This makes the security surface small and auditable."_

**Key decision to mention:**

> _"Redux never holds a seed phrase or private key. If you inspect Redux DevTools mid-session you'll see wallet addresses and balances — nothing sensitive. Secrets live exclusively in the OS Keychain with biometric access control."_

---

## 2 · Flow 1 — Create Wallet (2 minutes)

> _"Fresh install. The Keychain registry is empty."_

**Actions:**

1. Launch app → `SetupScreen` appears (no biometric prompt on first launch — nothing to unlock yet).
2. Tap **Create New Wallet**.

**Say:**

> _"CreateWalletScreen is a three-step flow: generate → backup → confirm. Let me walk through it."_

3. **Step 1 — Generate:** Tap _View Seed Phrase_. The 12-word phrase is blurred by default.

**Say:**

> _"The mnemonic is generated here using `@scure/bip39` with 128 bits of entropy — same spec as MetaMask and Ledger. It is shown once, never stored in Redux, never written to AsyncStorage. The only place it lands permanently is the Keychain — biometric-locked."_

4. Tap the blurred card to **reveal**, read the words aloud (demo phrase only), tap _I've Saved It_.

5. **Step 2 — Confirm:** Tick the checkbox, tap **Create Wallet with Biometrics**.

**Say:**

> _"Tapping this triggers `wdkService.createWallet` which stores the mnemonic in the Keychain with `BIOMETRY_CURRENT_SET` access control, then dispatches the wallet metadata — name, address, network — into Redux. Not the mnemonic. Just the metadata."_

6. App navigates to **WalletScreen** (Dashboard).

**Say:**

> _"Wallet created. Redux now knows a wallet exists and the user is unlocked. The mnemonic is already gone from memory."_

---

## 3 · Flow 2 — Unlock (1.5 minutes)

> _"Background the app for 30 seconds to trigger the automatic re-lock."_

**Actions:**

1. Press Home / swipe up → wait ~30 s → return to app.
2. App shows **UnlockScreen**. Face ID prompt fires automatically.

**Say:**

> _"This is `useAppLock` — a hook mounted at the app root that listens to React Native's `AppState`. If the app has been backgrounded for 30 seconds or more, it dispatches `setUnlocked(false)`. RootNavigator sees that and routes to UnlockScreen. No timer, no token — just a backgrounded timestamp and a comparison."_

3. Pass Face ID → Dashboard appears instantly.

**Say:**

> _"On success, `useBiometricAuth` retrieves the mnemonic from Keychain, derives the EVM address in memory using `getAddressFromMnemonic`, patches it into the wallet slice via `updateManagedWallet`, and dispatches `setUnlocked(true)`. The mnemonic goes out of scope — it is never stored anywhere after that point."_

**Key decision:**

> _"The unlock flow is biometric-first and automatic. There is no PIN fallback by design — a PIN can be brute-forced; a biometric cannot."_

---

## 4 · Flow 3 — Send (3 minutes)

> _"This is the most security-critical flow in the app."_

**Actions:**

1. Tap **Send** in the tab bar → `SendScreen`, Step 1: Address.

**Say:**

> _"Three-step flow: Address → Amount → Confirm. I can type an address, paste from clipboard, or scan a QR."_

2. Paste a valid test address. Tap **Continue**.

**Say:**

> _"Validation happens here: `isValidEVMAddress` checks the `0x` prefix and 40-hex-character format. We also check it isn't the sender's own address."_

3. **Step 2 — Amount.** Type `0.001`.

**Say:**

> _"Balance was fetched from the blockchain API when this step loaded. The MAX button subtracts the estimated gas fee so you can never accidentally over-send. The amount input enforces a single decimal point — no `0.0.01` type-os are possible."_

**Point out:** gas estimate shown inline as `Est. fee: ~0.000420 ETH`.

4. Tap **Review** → **Step 3 — Confirm.** Show the summary card.

**Say:**

> _"To, Amount, Network Fee, Total. Under the warning banner is a biometric note — the user is told they will be prompted before anything is broadcast. No surprises."_

5. Tap **Confirm & Send** → Face ID prompt appears.

**Say:**

> _"Here is the sequence that runs now:"_

> _"One — `walletStorageService.retrieveMnemonic` asks the OS to release the Keychain entry. The OS shows the Face ID prompt. Two — on success, the seed is in memory. Three — `HDKey.derive` produces the private key for BIP-44 path `m/44'/60'/0'/0/0`. Four — `evmSigner.signEvmTransaction` RLP-encodes the transaction, hashes it with `keccak-256`, and signs it with `secp256k1`. Recovery bit, r, and s come from the 65-byte output of noble/curves' `format: 'recovered'` option. Five — `privKey.fill(0)`. Private key is zeroed, regardless of success or failure — that's in a `finally` block. Six — only the signed hex string is sent to `blockchainApi.broadcastRawTx`. The server receives a sealed transaction, never a key."_

6. Pass Face ID → Success screen with tx hash.

**Key decision:**

> _"The original design passed a `privateKey` field to the backend. That is a critical vulnerability — OWASP A02. We replaced the entire send path with on-device signing. The server is a relay, not a signer."_

---

## 5 · Flow 4 — Receive (45 seconds)

**Actions:**

1. Tap **Receive** in the tab bar.

**Say:**

> _"QR code is generated from the active wallet address using `react-native-qrcode-svg`. Tap Copy Address to write it to the clipboard. No backend involved — the address is already in Redux from the unlock flow."_

2. Show the QR code. Tap **Copy Address** — toast/alert confirms.

---

## 6 · Key Decisions Summary (1 minute)

> _"Before I hand over, three architectural decisions worth calling out explicitly."_

### Keychain + Biometrics over any other secret storage

> _"AsyncStorage is unencrypted. Storing a seed phrase there — even base64-encoded — is the single most common crypto wallet vulnerability. We use `react-native-keychain` with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` and `BIOMETRY_CURRENT_SET`. The OS enforces this. Our code cannot bypass it."_

### Redux Toolkit for state — with explicit secret prohibition

> _"RTK gives us typed, immutable slices with built-in DevTools. The auth slice tracks session state. The wallet slice tracks metadata. The transactions slice tracks history. What all three have in common: they contain zero cryptographic material. This is enforced by code review rule, not just convention — the `STORAGE_KEYS` object in `storage.ts` had dangerous keys removed when we audited it."_

### Modular feature-folder structure

> _"Each feature lives in `src/modules/<feature>/`. Screens, hooks, and types for that feature are co-located. Shared UI is in `src/shared/components`. Core services are in `src/core`. This means a developer working on Send cannot accidentally break Transactions — and a security auditor can inspect the key-handling code in `src/core` without reading a single line of UI."_

---

## 7 · Closing (15 seconds)

> _"That's Axiom Wallet. Secure by default, built on industry-standard cryptography, and structured so the security boundaries are visible in the file tree — not just in comments._
>
> _Happy to go deeper on any part of the architecture or open any file."_

---

## Quick Reference — Key Files to Open if Asked

| Question                                   | File to show                                            |
| ------------------------------------------ | ------------------------------------------------------- |
| How is the private key derived and zeroed? | `src/core/api/wdkService.ts` → `signAndSendTransaction` |
| How is the transaction signed?             | `src/core/utils/evmSigner.ts`                           |
| How does Redux never store secrets?        | `src/core/storage/storage.ts` → `STORAGE_KEYS`          |
| How does Keychain storage work?            | `src/core/api/walletStorageService.ts`                  |
| How does biometric unlock work?            | `src/modules/auth/hooks/useBiometricAuth.ts`            |
| How does the 30-second re-lock work?       | `src/modules/auth/hooks/useAppLock.ts`                  |
| How does navigation route between states?  | `src/app/navigation/RootNavigator.tsx`                  |
