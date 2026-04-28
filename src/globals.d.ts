// Global type declarations for React Native
declare const __DEV__: boolean;

// react-native-vector-icons — types package not installed; declare locally.
declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle } from 'react-native';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }
  export default class Ionicons extends Component<IconProps> {}
}
