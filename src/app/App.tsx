import React, { useEffect } from 'react';
import { LogBox, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';
import { store } from '../store/store';
import { theme } from '../theme/colors';

function App() {
  const isDarkMode = true;
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';
  console.log('App Launch --- ');
  useEffect(() => {
    LogBox.ignoreAllLogs();
  }, []);
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <SafeAreaProvider>
          <AppProviders>
            <StatusBar
              barStyle={barStyle}
              backgroundColor={
                isDarkMode
                  ? theme.colors.dark.background
                  : theme.colors.light.background
              }
            />
            <RootNavigator />
          </AppProviders>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
