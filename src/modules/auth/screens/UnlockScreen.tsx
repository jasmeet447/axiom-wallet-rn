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

const DARK = {
  bg: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  error: '#FF453A',
  errorBg: '#2C1214',
  border: '#38383A',
};

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
    Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometrics';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={64} color={DARK.primary} />
        </View>

        {/* Heading */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Verify your identity to access your wallet
        </Text>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle"
              size={18}
              color={DARK.error}
              style={styles.errorIcon}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Primary action */}
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={DARK.primary}
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
              color="#FFFFFF"
              style={styles.btnIcon}
            />
            <Text style={styles.unlockBtnText}>
              Unlock with {biometricLabel}
            </Text>
          </TouchableOpacity>
        )}

        {attemptCount > 1 && !isLoading && (
          <Text style={styles.hint}>
            Make sure your device biometrics are enrolled.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: DARK.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: DARK.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DARK.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: DARK.subtle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.errorBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DARK.error,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: DARK.error,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
    maxHeight: 48,
  },
  loader: {
    marginBottom: 16,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    minHeight: 56,
  },
  btnIcon: {
    marginRight: 10,
  },
  unlockBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: DARK.subtle,
    textAlign: 'center',
  },
});
