import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { WalletScreen } from '../../modules/wallet/screens/WalletScreen';
import { SendScreen } from '../../modules/send/screens/SendScreen';
import { ReceiveScreen } from '../../modules/receive/screens/ReceiveScreen';
import { TransactionsScreen } from '../../modules/transactions/screens/TransactionsScreen';

export type MainStackParamList = {
  Wallet: undefined;
  Send: undefined;
  Receive: undefined;
  Transactions: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  const darkHeader = {
    headerStyle: { backgroundColor: '#000000' },
    headerTintColor: '#FFFFFF',
    headerTitleStyle: { fontWeight: '600' as const },
    headerShadowVisible: false,
  };

  return (
    <Stack.Navigator
      initialRouteName="Wallet"
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
        ...darkHeader,
      }}
    >
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Send"
        component={SendScreen}
        options={{ title: 'Send' }}
      />
      <Stack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{ title: 'Receive' }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ title: 'Transaction History' }}
      />
    </Stack.Navigator>
  );
};
