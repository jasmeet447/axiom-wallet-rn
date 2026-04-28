/**
 * Theme barrel export.
 * Import anything theme-related from 'src/theme' instead of deep paths.
 *
 * @example
 *   import { darkPalette, typography, spacing, borderRadius } from '../../../theme';
 */
export { colors, darkPalette, theme } from './colors';
export type { ColorScheme, Colors, DarkPalette, Theme } from './colors';

export {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from './spacing';

export { typography } from './typography';
