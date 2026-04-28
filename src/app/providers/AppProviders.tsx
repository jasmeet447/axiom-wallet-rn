import React, { ReactNode } from 'react';
import { WdkProvider } from './WdkProvider';
import { useAppLock } from '../../modules/auth/hooks/useAppLock';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Thin wrapper that runs the background-lock hook inside the Redux Provider
 * (App.tsx mounts <Provider> above <AppProviders>).
 */
const AppLockGate: React.FC<{ children: ReactNode }> = ({ children }) => {
  useAppLock();
  return <>{children}</>;
};

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <WdkProvider>
      <AppLockGate>{children}</AppLockGate>
    </WdkProvider>
  );
};
