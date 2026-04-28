import React, { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // Add any additional context providers here (theme, auth, etc.)
  return <>{children}</>;
};
