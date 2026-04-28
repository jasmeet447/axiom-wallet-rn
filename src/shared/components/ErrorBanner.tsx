import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { darkPalette, spacing, borderRadius } from '../../theme';

interface ErrorBannerProps {
  /** The error message to display */
  message: string;
  style?: ViewStyle;
}

/**
 * Inline error banner — the same pattern repeated in Unlock, CreateWallet,
 * and ImportWallet screens.  Displays a red-bordered pill with an alert icon.
 */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, style }) => (
  <View style={[styles.container, style]}>
    <Ionicons
      name="alert-circle"
      size={16}
      color={darkPalette.error}
      style={styles.icon}
    />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.errorBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: darkPalette.error,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    color: darkPalette.error,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
