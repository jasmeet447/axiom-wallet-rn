import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

const DARK = {
  bg: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  border: '#38383A',
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Setup'>;

export const SetupScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Ionicons name="diamond" size={56} color={DARK.primary} />
          </View>
          <Text style={styles.appName}>Axiom Wallet</Text>
          <Text style={styles.tagline}>
            A secure, self-custodial crypto wallet.{`\n`}You own your keys.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('CreateWallet')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="#FFF"
              style={styles.btnIcon}
            />
            <View>
              <Text style={styles.btnTitle}>Create New Wallet</Text>
              <Text style={styles.btnSubtitle}>Generate a fresh wallet</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('ImportWallet')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="download-outline"
              size={22}
              color={DARK.primary}
              style={styles.btnIcon}
            />
            <View>
              <Text style={[styles.btnTitle, { color: DARK.primary }]}>
                Import Existing Wallet
              </Text>
              <Text style={styles.btnSubtitle}>Restore from seed phrase</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Your keys are stored securely on this device and never leave it.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: DARK.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARK.border,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: DARK.text,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: DARK.subtle,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: { gap: 14 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.primary,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.card,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: DARK.border,
  },
  btnIcon: { flexShrink: 0 },
  btnTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 2 },
  btnSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: DARK.subtle,
    marginTop: 20,
    lineHeight: 18,
  },
});
