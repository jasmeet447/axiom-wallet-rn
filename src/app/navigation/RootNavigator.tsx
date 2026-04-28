import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { darkPalette } from '../../theme';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { UnlockScreen } from '../../modules/auth/screens/UnlockScreen';
import { useAppSelector } from '../../store/hooks';

type RootStackParamList = {
  Auth: undefined;
  Unlock: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Shown while WdkProvider bootstrap is running. */
const BootSplash: React.FC = () => (
  <View style={splash.container}>
    <ActivityIndicator size="large" color={darkPalette.primary} />
  </View>
);

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkPalette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const RootNavigator: React.FC = () => {
  // Read auth state directly from Redux — single source of truth.
  const { isInitialised, isAuthenticated, isUnlocked } = useAppSelector(
    state => state.auth,
  );

  if (!isInitialised) {
    return <BootSplash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {isAuthenticated && isUnlocked ? (
          // Wallet exists and biometric passed → main app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : isAuthenticated && !isUnlocked ? (
          // Wallet exists but not yet unlocked → biometric gate
          <Stack.Screen name="Unlock" component={UnlockScreen} />
        ) : (
          // First launch or after logout → onboarding flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
