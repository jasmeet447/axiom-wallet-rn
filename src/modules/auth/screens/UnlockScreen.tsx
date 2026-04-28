import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { AuthStrings } from '../../../constants/strings';
import { AppIconCircle, ErrorBanner } from '../../../shared/components';

export const UnlockScreen: React.FC = () => {
  const { unlock, isLoading, error } = useBiometricAuth();
  const [attemptCount, setAttemptCount] = useState(0);

  const triggerUnlock = useCallback(async () => {
    setAttemptCount(n => n + 1);
    await unlock();
  }, [unlock]);

  // Auto-trigger biometric prompt on first mount
  useEffect(() => {
    triggerUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const biometricLabel =
    Platform.OS === 'ios'
      ? AuthStrings.unlock.biometricIos
      : AuthStrings.unlock.biometricAndroid;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <AppIconCircle iconName="lock-closed" iconSize={64} diameter={112} />

        <Text style={styles.title}>{AuthStrings.unlock.title}</Text>
        <Text style={styles.subtitle}>{AuthStrings.unlock.subtitle}</Text>

        {error ? (
          <ErrorBanner message={error} style={styles.errorBanner} />
        ) : null}

        <View style={styles.spacer} />

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={darkPalette.primary}
            style={styles.loader}
          />
        ) : (
          <TouchableOpacity
            style={styles.unlockBtn}
            onPress={triggerUnlock}
            activeOpacity={0.8}
          >
            <Ionicons
              name={Platform.OS === 'ios' ? 'face-id' : 'finger-print'}
              size={24}
              color={darkPalette.text}
              style={styles.btnIcon}
            />
            <Text style={styles.unlockBtnText}>
              {AuthStrings.unlock.unlockBtnPrefix}
              {biometricLabel}
            </Text>
          </TouchableOpacity>
        )}

        {attemptCount > 1 && !isLoading && (
          <Text style={styles.hint}>{AuthStrings.unlock.enrollHint}</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: darkPalette.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: darkPalette.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: darkPalette.subtle,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorBanner: {
    width: '100%',
  },
  spacer: {
    flex: 1,
    maxHeight: 48,
  },
  loader: {
    marginBottom: spacing.md,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.xl - 2,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    width: '100%',
    minHeight: 56,
  },
  btnIcon: {
    marginRight: 10,
  },
  unlockBtnText: {
    ...typography.labelLarge,
    color: darkPalette.text,
  },
  hint: {
    marginTop: spacing.md,
    ...typography.bodySmall,
    color: darkPalette.subtle,
    textAlign: 'center',
  },
});
