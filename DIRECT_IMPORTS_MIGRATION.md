# Import Architecture — Current State

## Overview

The project originally used barrel-export `index.ts` files everywhere. These were removed in an earlier migration pass. Since then, **selective barrel exports have been re-added** for domains where consumers commonly need multiple imports at once, while most module internals still use direct imports.

---

## Current Import Architecture

### Directories with Barrel Exports (`index.ts`)

| File | What it exports |
|---|---|
| `src/store/index.ts` | Store, typed hooks (`useAppDispatch`, `useAppSelector`, `useAppStore`), all slice actions + types from all three slices |
| `src/theme/index.ts` | `colors`, `darkPalette`, `theme`, `typography`, `spacing`, `borderRadius`, `fontSize`, `fontWeight`, `shadows` |
| `src/shared/components/index.ts` | `Button`, `Card`, `Input`, `Loading`, `ErrorView`, `ErrorBanner`, `AppIconCircle`, `ScreenHeader`, `SkeletonBlock`, `WalletCardSkeleton`, `TransactionListSkeleton` |
| `src/constants/strings/index.ts` | All per-feature string constant objects |

### Directories without Barrel Exports (direct imports only)

| Directory | Import pattern |
|---|---|
| `src/core/api/` | `import { wdkService } from '../../../core/api/wdkService'` |
| `src/core/biometric/` | `import { biometricService } from '../../../core/biometric/biometricService'` |
| `src/core/config/` | `import { wdkConfigs } from '../../../core/config/wdkConfig'` |
| `src/core/storage/` | `import { storage } from '../../../core/storage/storage'` |
| `src/core/utils/` | `import { truncateAddress } from '../../../core/utils/formatters'` |
| `src/app/navigation/` | Direct imports from individual navigator files |
| `src/app/providers/` | Direct imports from individual provider files |
| `src/modules/**/hooks/` | Direct imports from individual hook files |
| `src/modules/**/screens/` | Direct imports from individual screen files |

---

## Import Pattern Examples

### Barrel import (store)
```typescript
// ✅ One import for multiple store values
import {
  useAppDispatch,
  useAppSelector,
  setUnlocked,
  addManagedWallet,
  setTransactions,
} from '../../../store';
import type { ManagedWallet, Transaction } from '../../../store';
```

### Direct import (core services)
```typescript
// ✅ Direct — core services always use direct imports
import { wdkService } from '../../../core/api/wdkService';
import { walletStorageService } from '../../../core/api/walletStorageService';
import { truncateAddress } from '../../../core/utils/formatters';
```

### Mixed (shared components)
```typescript
// ✅ Barrel — fine for many components from the same directory
import { Button, Card, ScreenHeader, WalletCardSkeleton } from '../../../shared/components';

// ✅ Direct — equally valid
import { Button } from '../../../shared/components/Button';
```

---

## Principles

1. **Core services always use direct imports** — explicit dependency tracking for security-critical code.
2. **State/UI domains expose barrels** — store, theme, shared components, and string constants are used widely; barrels reduce import boilerplate.
3. **Module internals use direct imports** — screens import their own hooks directly; no module imports another module's internals via barrel.
4. **No circular imports** — modules never import from each other; they share only through `store`, `theme`, `shared/components`, and `core`.

---

## File Count (current)

```
src/                          ~62 TypeScript / JavaScript files
  ├── app/                     5 files (App + 3 nav + 2 providers)
  ├── constants/strings/       7 files (6 domain + 1 barrel)
  ├── core/                   10 files (api 4, biometric 1, config 2, storage 1, utils 4)
  ├── modules/                11 files (5 auth + 3 wallet + 1 send + 1 receive + 2 tx)
  ├── shared/components/      10 files (9 components + 1 barrel)
  ├── shims/                   1 file
  ├── store/                   5 files (store + hooks + barrel + 3 slices)
  ├── theme/                   4 files (colors + typography + spacing + barrel)
  └── globals.d.ts             1 file
```
