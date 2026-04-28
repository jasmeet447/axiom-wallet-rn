import * as Keychain from 'react-native-keychain';

export interface BiometricCredentials {
  username: string;
  password: string;
}

export const biometricService = {
  // Check if biometric authentication is available
  isBiometricAvailable: async (): Promise<boolean> => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  // Get supported biometry type
  getBiometryType: async (): Promise<Keychain.BIOMETRY_TYPE | null> => {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  },

  // Store credentials with biometric protection
  storeCredentials: async (
    username: string,
    password: string,
    serviceName = 'AxiomWallet',
  ): Promise<boolean> => {
    try {
      await Keychain.setGenericPassword(username, password, {
        service: serviceName,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
      });
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  },

  // Retrieve credentials with biometric authentication
  retrieveCredentials: async (
    serviceName = 'AxiomWallet',
  ): Promise<BiometricCredentials | null> => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: serviceName,
        authenticationPrompt: {
          title: 'Authenticate to access your wallet',
          subtitle: 'Use biometric authentication',
        },
      });

      if (credentials && credentials.username && credentials.password) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  },

  // Delete stored credentials
  deleteCredentials: async (serviceName = 'AxiomWallet'): Promise<boolean> => {
    try {
      await Keychain.resetGenericPassword({ service: serviceName });
      return true;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  },

  // Store PIN code securely
  storePIN: async (pin: string): Promise<boolean> => {
    return biometricService.storeCredentials('pin', pin, 'AxiomWallet_PIN');
  },

  // Retrieve PIN code
  retrievePIN: async (): Promise<string | null> => {
    const credentials = await biometricService.retrieveCredentials(
      'AxiomWallet_PIN',
    );
    return credentials?.password || null;
  },

  // Delete PIN code
  deletePIN: async (): Promise<boolean> => {
    return biometricService.deleteCredentials('AxiomWallet_PIN');
  },
};
