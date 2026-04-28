import { StyleSheet } from 'react-native';
import { fontSize, fontWeight } from './spacing';

/**
 * Centralised text style tokens for the app.
 * Import via: import { typography } from '../theme';
 */
export const typography = StyleSheet.create({
  // ─── Display ───────────────────────────────────────────────────────────────
  displayLarge: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  displayMedium: {
    fontSize: 26,
    fontWeight: fontWeight.bold,
    letterSpacing: 0,
    lineHeight: 34,
  },

  // ─── Headings ──────────────────────────────────────────────────────────────
  h1: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 32,
  },
  h2: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: 28,
  },
  h3: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },

  // ─── Body ──────────────────────────────────────────────────────────────────
  bodyLarge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: 18,
  },

  // ─── Labels ────────────────────────────────────────────────────────────────
  labelLarge: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: 24,
  },
  labelMedium: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
    lineHeight: 18,
  },

  // ─── Special ───────────────────────────────────────────────────────────────
  /** Monospaced — wallet addresses, seed words */
  mono: {
    fontSize: fontSize.sm,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  /** ALL-CAPS micro-label (section headings, pills) */
  overline: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    lineHeight: 16,
  },
  /** Large balance / numeric display */
  numericXL: {
    fontSize: 38,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  numericLG: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
  caption: {
    fontSize: 11,
    fontWeight: fontWeight.regular,
    lineHeight: 15,
  },
});
