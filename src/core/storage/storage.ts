import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys — AsyncStorage is NOT encrypted; only store non-sensitive
// preferences here.  Secrets (mnemonic, private key, PIN, auth tokens) must
// be stored exclusively in the system Keychain via walletStorageService or
// biometricService — never added to this object.
export const STORAGE_KEYS = {
  USER_DATA: '@user_data',
  BIOMETRIC_ENABLED: '@biometric_enabled',
  NETWORK: '@network',
} as const;

export const storage = {
  // Get item
  getItem: async <T = string>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  // Set item
  setItem: async <T = any>(key: string, value: T): Promise<void> => {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  // Remove item
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },

  // Clear all
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  // Get multiple items
  multiGet: async (keys: string[]): Promise<Record<string, any>> => {
    try {
      const values = await AsyncStorage.multiGet(keys);
      return values.reduce((acc, [key, value]) => {
        if (value !== null) {
          try {
            acc[key] = JSON.parse(value);
          } catch {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      throw error;
    }
  },

  // Set multiple items
  multiSet: async (keyValuePairs: Array<[string, any]>): Promise<void> => {
    try {
      const stringPairs = keyValuePairs.map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]) as Array<[string, string]>;
      await AsyncStorage.multiSet(stringPairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  },
};
