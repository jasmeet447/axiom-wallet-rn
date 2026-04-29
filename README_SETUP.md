# AxiomWallet - Project Setup & Installation

## Prerequisites

- Node.js >= 22.11.0
- npm or yarn
- React Native development environment (Xcode for iOS, Android Studio for Android)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Install iOS Dependencies

```bash
cd ios
pod install
cd ..
```

## Step 3: Run the Application

### iOS

```bash
npm run ios
# or
npx react-native run-ios
```

### Android

```bash
npm run android
# or
npx react-native run-android
```

## Project Features

- ✅ Feature-based modular architecture
- ✅ Redux Toolkit for state management
- ✅ React Navigation for routing (Native Stack + Bottom Tabs)
- ✅ TypeScript for type safety
- ✅ Biometric authentication (Face ID / fingerprint via react-native-keychain)
- ✅ On-device EIP-155 transaction signing (BIP-39/32, secp256k1, keccak-256)
- ✅ Multi-wallet support with per-wallet biometric-protected Keychain slots
- ✅ 30-second automatic session re-lock
- ✅ QR code receive flow (react-native-qrcode-svg)
- ✅ Skeleton loading states for balance and transaction list
- ✅ AsyncStorage for non-sensitive preferences
- ✅ Dark mode / dark theme throughout
- ✅ Axios-based API client
- ✅ Reusable component library
- ✅ Direct imports (no barrel exports) + convenience barrel exports where helpful

## Key Dependencies

- **React Native**: 0.85.2
- **Redux Toolkit**: 2.11.2
- **React Navigation**: 7.2.2 (Native Stack + Bottom Tabs)
- **React Native Keychain**: 10.0.0
- **AsyncStorage**: 2.2.0
- **Axios**: 1.15.2
- **Tether WDK**: 1.0.0-beta.9
- **@scure/bip39 + bip32**: BIP-39/44 mnemonic & key derivation
- **@noble/curves + hashes**: secp256k1 ECDSA signing + keccak-256

## Import Structure

This project uses **direct imports**. All imports point directly to source files:

```typescript
// ✅ Direct imports
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';

// ❌ No barrel exports
import { LoginScreen } from '../../modules/auth/screens'; // This won't work
```

See [IMPORT_STRUCTURE.md](./IMPORT_STRUCTURE.md) for complete import reference.

## Troubleshooting

### Metro bundler cache issues

```bash
npm start -- --reset-cache
```

### Build issues

#### iOS

```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### Android

```bash
cd android
./gradlew clean
cd ..
```

### TypeScript errors

```bash
npx tsc --noEmit
```

## Project Structure

```
src/
├── app/              # App entry, navigation, providers
├── store/            # Redux store & slices
├── core/             # API, storage, biometric, utils
├── modules/          # Feature modules (auth, wallet, send, receive, transactions)
├── shared/           # Reusable components
└── theme/            # Design tokens (colors, spacing, typography)
```

See [STRUCTURE.md](./STRUCTURE.md) for detailed folder structure documentation.

## Development Guidelines

1. **Direct Imports**: Always import directly from source files
2. **Type Safety**: Use TypeScript for all new code
3. **Redux**: Use typed hooks (`useAppDispatch`, `useAppSelector`)
4. **Components**: Keep components small and focused
5. **Styling**: Use theme constants from `theme/colors.ts`
6. **Error Handling**: Use utilities from `core/utils/errors.ts`

## Next Steps

1. ✅ Project structure created
2. ✅ All imports configured
3. ⏳ Install AsyncStorage
4. ⏳ Implement screen logic
5. ⏳ Integrate Tether WDK
6. ⏳ Add authentication flow
7. ⏳ Add tests
8. ⏳ Add error boundaries

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Native Keychain](https://github.com/oblador/react-native-keychain)
