import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { SetupScreen } from '../../modules/auth/screens/SetupScreen';

export type AuthStackParamList = {
  Login: undefined;
  Setup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
    </Stack.Navigator>
  );
};
