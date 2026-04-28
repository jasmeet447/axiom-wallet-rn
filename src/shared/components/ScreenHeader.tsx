import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { darkPalette, spacing } from '../../theme';

interface ScreenHeaderProps {
  /** Called when the back chevron is pressed */
  onBack: () => void;
  /** Optional title rendered to the right of the back button */
  title?: string;
  style?: ViewStyle;
}

/**
 * Minimal back-button header reused across multi-step screens
 * (CreateWallet, ImportWallet, etc.).
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onBack,
  title,
  style,
}) => (
  <View style={[styles.row, style]}>
    <TouchableOpacity
      style={styles.backBtn}
      onPress={onBack}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={26} color={darkPalette.primary} />
    </TouchableOpacity>
    {title ? <Text style={styles.title}>{title}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    minHeight: 44,
  },
  backBtn: {
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: darkPalette.text,
  },
});
