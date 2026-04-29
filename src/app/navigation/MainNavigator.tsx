import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { darkPalette } from '../../theme';

import { WalletScreen } from '../../modules/wallet/screens/WalletScreen';
import { SendScreen } from '../../modules/send/screens/SendScreen';
import { ReceiveScreen } from '../../modules/receive/screens/ReceiveScreen';
import { TransactionsScreen } from '../../modules/transactions/screens/TransactionsScreen';

// ─── Route param lists ────────────────────────────────────────────────────────
export type MainTabParamList = {
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  Transactions: undefined;
};

/** Legacy alias — keeps existing screen imports compiling without changes. */
export type MainStackParamList = MainTabParamList;

export type MainTabNavProp<T extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, T>;

// ─── Tab icon config ──────────────────────────────────────────────────────────
const TAB_ICONS: Record<
  keyof MainTabParamList,
  { outline: string; filled: string; label: string }
> = {
  Home: { outline: 'wallet-outline', filled: 'wallet', label: 'Home' },
  Send: {
    outline: 'arrow-up-circle-outline',
    filled: 'arrow-up-circle',
    label: 'Send',
  },
  Receive: {
    outline: 'arrow-down-circle-outline',
    filled: 'arrow-down-circle',
    label: 'Receive',
  },
  Transactions: { outline: 'time-outline', filled: 'time', label: 'History' },
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// ─── MainNavigator ─────────────────────────────────────────────────────────────
export const MainNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={({ route }) => {
      const cfg = TAB_ICONS[route.name as keyof MainTabParamList];
      return {
        headerShown: false,
        // Icon
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? cfg.filled : cfg.outline}
            size={size}
            color={color}
          />
        ),
        tabBarLabel: cfg.label,
        // Colours
        tabBarActiveTintColor: darkPalette.primary,
        tabBarInactiveTintColor: darkPalette.subtle,
        // Tab bar appearance
        tabBarStyle: {
          backgroundColor: darkPalette.bg,
          borderTopColor: darkPalette.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          marginTop: 2,
        },
        // Smooth cross-fade when switching tabs
        // animation: 'fade',
      };
    }}
  >
    <Tab.Screen name="Home" component={WalletScreen} />
    <Tab.Screen name="Send" component={SendScreen} />
    <Tab.Screen name="Receive" component={ReceiveScreen} />
    {/* <Tab.Screen name="Transactions" component={TransactionsScreen} /> */}
  </Tab.Navigator>
);
