import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { darkPalette, spacing, fontSize } from '../../theme';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={darkPalette.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: darkPalette.bg,
    padding: spacing.md,
  },
  message: {
    marginTop: 12,
    fontSize: fontSize.sm,
    color: darkPalette.subtle,
  },
});
