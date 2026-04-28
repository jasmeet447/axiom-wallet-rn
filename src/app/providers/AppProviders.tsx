import React, { ReactNode } from 'react';
import { WdkProvider } from './WdkProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return <WdkProvider>{children}</WdkProvider>;
};
