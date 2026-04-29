/**
 * Stub for expo-local-authentication in a bare React Native CLI app.
 *
 * wdk-react-native-secure-storage imports expo-local-authentication for
 * optional biometric gating of keychain reads. In a CLI (non-Expo) project
 * the native ExpoLocalAuthentication module is never registered, causing a
 * crash at module evaluation time.
 *
 * This shim makes all biometric checks report "not available", so WDK falls
 * back to non-biometric keychain access. Actual biometric auth in the app is
 * handled separately by useBiometricAuth.ts via the WDK wallet unlock flow.
 */

export const SecurityLevel = {
  NONE: 0,
  SECRET: 1,
  BIOMETRIC_WEAK: 2,
  BIOMETRIC_STRONG: 3,
};

export const AuthenticationType = {
  FINGERPRINT: 1,
  FACIAL_RECOGNITION: 2,
  IRIS: 3,
};

export async function hasHardwareAsync() {
  return false;
}

export async function isEnrolledAsync() {
  return false;
}

export async function getEnrolledLevelAsync() {
  return SecurityLevel.NONE;
}

export async function supportedAuthenticationTypesAsync() {
  return [];
}

export async function authenticateAsync() {
  return { success: false, error: 'not_available' };
}

export async function cancelAuthenticate() {}
