import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SetupScreen } from '../../modules/auth/screens/SetupScreen';
import { CreateWalletScreen } from '../../modules/auth/screens/CreateWalletScreen';
import { ImportWalletScreen } from '../../modules/auth/screens/ImportWalletScreen';

export type AuthStackParamList = {
  Setup: undefined;
  CreateWallet: undefined;
  ImportWallet: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Setup"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
    </Stack.Navigator>
  );
};
