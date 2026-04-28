import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { UnlockScreen } from '../../modules/auth/screens/UnlockScreen';
import { useBiometricAuth } from '../../modules/auth/hooks/useBiometricAuth';

type RootStackParamList = {
  Auth: undefined;
  Unlock: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Shown while bootstrap() is running — keeps the splash-screen feel. */
const BootSplash: React.FC = () => (
  <View style={splash.container}>
    <ActivityIndicator size="large" color="#0A84FF" />
  </View>
);

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const RootNavigator: React.FC = () => {
  const { bootstrap, isInitialised, isAuthenticated, isUnlocked } =
    useBiometricAuth();

  // Run once on mount: silently check keychain for an existing wallet
  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
