import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { darkPalette } from '../../theme';

interface AppIconCircleProps {
  /** Ionicons icon name */
  iconName: string;
  /** Size of the icon (default 52) */
  iconSize?: number;
  /** Diameter of the circle (default 96) */
  diameter?: number;
  /** Icon colour (defaults to primary) */
  iconColor?: string;
  style?: ViewStyle;
}

/**
 * Reusable branded icon circle used on onboarding / utility screens.
 * Replaces the identical `logoWrap` / `iconWrap` pattern in 4+ screens.
 */
export const AppIconCircle: React.FC<AppIconCircleProps> = ({
  iconName,
  iconSize = 52,
  diameter = 96,
  iconColor = darkPalette.primary,
  style,
}) => {
  const size = diameter;
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: darkPalette.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: darkPalette.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
