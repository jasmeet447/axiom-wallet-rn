import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { darkPalette, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.md,
    marginBottom: 12,
    ...shadows.md,
  },
});
