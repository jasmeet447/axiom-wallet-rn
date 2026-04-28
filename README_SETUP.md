# AxiomWallet - Project Setup & Installation

## Prerequisites

- Node.js >= 22.11.0
- npm or yarn
- React Native development environment (Xcode for iOS, Android Studio for Android)

## Step 1: Install Dependencies

```bash
npm install
```

### Missing Dependency
AsyncStorage is not yet installed. Add it with:

```bash
npm install @react-native-async-storage/async-storage
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
- ✅ React Navigation for routing
- ✅ TypeScript for type safety
- ✅ Biometric authentication ready (React Native Keychain)
- ✅ Secure storage with AsyncStorage
- ✅ Dark mode support
- ✅ Axios-based API client
- ✅ Reusable component library
- ✅ Direct imports (no barrel exports)

## Key Dependencies

- **React Native**: 0.85.2
- **Redux Toolkit**: 2.11.2
- **React Navigation**: 7.x
- **React Native Keychain**: 10.0.0
- **Axios**: 1.15.2
- **Tether WDK**: 1.0.0-beta.8

## Import Structure

This project uses **direct imports**. All imports point directly to source files:

```typescript
// ✅ Direct imports
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { Button } from '../../../shared/components/Button';

// ❌ No barrel exports
import { LoginScreen } from '../../modules/auth/screens';  // This won't work
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
