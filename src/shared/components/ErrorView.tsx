import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  darkPalette,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../../theme';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkPalette.bg,
    padding: spacing.lg,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: fontSize.md,
    color: darkPalette.subtle,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: darkPalette.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
