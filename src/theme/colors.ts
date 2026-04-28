import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from './spacing';

export const colors = {
  light: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    placeholder: '#999999',
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    placeholder: '#666666',
  },
};

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof colors.light;

/**
 * Flat dark-palette convenience object used by all screens.
 * This avoids each screen defining its own `const C = {...}` / `const DARK = {...}`.
 */
export const darkPalette = {
  bg: '#000000',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  success: '#30D158',
  warning: '#FF9F0A',
  warningBg: '#2C2000',
  error: '#FF453A',
  errorBg: '#2C1214',
  border: '#38383A',
  inputBg: '#2C2C2E',
  /** Translucent tints for glows / badges */
  primaryFaint: '#0A84FF14',
  primaryMid: '#0A84FF40',
  primaryBorder: '#0A84FF60',
  successFaint: '#30D15818',
  successBorder: '#30D15860',
  successBg: '#0D2B0D',
} as const;

export type DarkPalette = typeof darkPalette;

// Combined theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};

export type Theme = typeof theme;
