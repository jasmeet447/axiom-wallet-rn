import React, { ReactNode } from 'react';

import * as WDKContext from '@tetherto/wdk-react-native-core';

import { WdkProvider } from './WdkProvider';
import { useAppLock } from '../../modules/auth/hooks/useAppLock';
import { wdkConfigs } from '../../core/config/wdkConfig';
// import wdkBundle from '../../../.wdk-bundle/wdk-worklet.bundle';
const wdkBundle = require('../../../.wdk-bundle/wdk-worklet.bundle');

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
    <WDKContext.WdkAppProvider
      wdkConfigs={wdkConfigs}
      bundle={{ bundle: wdkBundle }}
    >
      <WdkProvider>
        <AppLockGate>{children}</AppLockGate>
      </WdkProvider>
    </WDKContext.WdkAppProvider>
  );
};
