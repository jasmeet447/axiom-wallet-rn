/**
 * @format
 */

// Must be imported before any module that uses crypto.getRandomValues
// (e.g. @scure/bip39, @noble/curves). This polyfills the Web Crypto API
// in the React Native / Hermes environment.
import 'react-native-get-random-values';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
