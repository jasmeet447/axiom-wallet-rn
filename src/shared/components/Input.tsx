import React from 'react';
import {
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Text,
} from 'react-native';
import {
  darkPalette,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../../theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={darkPalette.subtle}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    color: darkPalette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: darkPalette.border,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    backgroundColor: darkPalette.inputBg,
    color: darkPalette.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: darkPalette.error,
  },
  error: {
    fontSize: fontSize.xs,
    color: darkPalette.error,
    marginTop: spacing.xs,
  },
});
