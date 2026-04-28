/**
 * useAppLock
 *
 * Listens to React Native's AppState and automatically sets `isUnlocked =
 * false` in Redux when the app has been in the background / inactive for
 * longer than LOCK_TIMEOUT_MS.  The next foreground event will be caught by
 * RootNavigator which re-routes to UnlockScreen.
 *
 * Mount this hook inside the Redux Provider but outside any screen so it
 * runs for the entire app lifecycle.
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setUnlocked } from '../../../store';

/** Seconds the app may stay backgrounded before requiring a fresh biometric. */
const LOCK_TIMEOUT_MS = 30_000; // 30 seconds

export function useAppLock(): void {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const isUnlocked = useAppSelector(s => s.auth.isUnlocked);

  // Ref so the handler always has the latest flags without re-subscribing
  const stateRef = useRef({ isAuthenticated, isUnlocked });
  stateRef.current = { isAuthenticated, isUnlocked };

  const bgTimestamp = useRef<number | null>(null);

  useEffect(() => {
    const onStateChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        // Record the moment the app left the foreground
        bgTimestamp.current = Date.now();
      } else if (next === 'active') {
        const { isAuthenticated: authed, isUnlocked: unlocked } =
          stateRef.current;
        if (
          authed &&
          unlocked &&
          bgTimestamp.current !== null &&
          Date.now() - bgTimestamp.current >= LOCK_TIMEOUT_MS
        ) {
          dispatch(setUnlocked(false));
        }
        bgTimestamp.current = null;
      }
    };

    const sub = AppState.addEventListener('change', onStateChange);
    return () => sub.remove();
  }, [dispatch]);
}
