import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useWdkWallet } from '../../wallet/hooks/useWdkWallet';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

const DARK = {
  bg: '#000000',
  card: '#1C1C1E',
  card2: '#2C2C2E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  warningBg: '#2C2000',
  error: '#FF453A',
  border: '#38383A',
};

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateWallet'>;

type Step = 'generate' | 'backup' | 'confirm';

export const CreateWalletScreen: React.FC<Props> = ({ navigation }) => {
  const { generateMnemonic, createWallet } = useWdkWallet();
  const [step, setStep] = useState<Step>('generate');
  // Generate a real BIP-39 mnemonic once on mount using @scure/bip39
  const [mnemonic] = useState<string>(() => generateMnemonic());
  const [seedWords] = useState<string[]>(() => mnemonic.split(' '));
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the wallet name "Main Wallet" by default; can be made configurable later
  const WALLET_ID = 'Main Wallet';

  const handleCreate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await createWallet(WALLET_ID);
      // Navigation is handled by RootNavigator reacting to Redux auth state change
    } catch (e: any) {
      setError(e?.message ?? 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [createWallet]);

  const renderGenerateStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconWrap}>
        <Ionicons name="wallet" size={52} color={DARK.primary} />
      </View>
      <Text style={styles.title}>Create New Wallet</Text>
      <Text style={styles.subtitle}>
        A unique wallet will be generated for you. You will need to save your
        secret recovery phrase to restore access if you change devices.
      </Text>

      <View style={styles.warningCard}>
        <Ionicons
          name="warning"
          size={20}
          color={DARK.warning}
          style={styles.warnIcon}
        />
        <Text style={styles.warningText}>
          Never share your seed phrase. Anyone with it has full access to your
          wallet.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => setStep('backup')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>View Seed Phrase</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderBackupStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Save Your Seed Phrase</Text>
      <Text style={styles.subtitle}>
        Write these words down in order and store them somewhere safe.
      </Text>

      <TouchableOpacity
        style={styles.seedCard}
        onPress={() => setRevealed(r => !r)}
        activeOpacity={0.9}
      >
        {revealed ? (
          <View style={styles.seedGrid}>
            {seedWords.map((word, idx) => (
              <View key={idx} style={styles.seedWord}>
                <Text style={styles.seedIndex}>{idx + 1}.</Text>
                <Text style={styles.seedText}>{word}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.seedBlur}>
            <Ionicons name="eye-off-outline" size={32} color={DARK.subtle} />
            <Text style={styles.seedBlurText}>Tap to reveal</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryBtn, !revealed && styles.btnDisabled]}
        onPress={() => revealed && setStep('confirm')}
        activeOpacity={0.8}
        disabled={!revealed}
      >
        <Text style={styles.primaryBtnText}>I've Saved It</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark" size={52} color={DARK.success} />
      </View>
      <Text style={styles.title}>Ready to Go</Text>
      <Text style={styles.subtitle}>
        Your wallet is ready. Biometric authentication will be used to unlock it
        on future launches.
      </Text>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons
            name="alert-circle"
            size={16}
            color={DARK.error}
            style={styles.iconMr}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.checkRow, confirmed && styles.checkRowActive]}
        onPress={() => setConfirmed(c => !c)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
          {confirmed && <Ionicons name="checkmark" size={14} color="#FFF" />}
        </View>
        <Text style={styles.checkLabel}>
          I confirm I have securely saved my seed phrase.
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={DARK.primary}
          style={styles.loader}
        />
      ) : (
        <TouchableOpacity
          style={[styles.primaryBtn, !confirmed && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={!confirmed || isLoading}
          activeOpacity={0.8}
        >
          <Ionicons
            name="finger-print"
            size={20}
            color="#FFF"
            style={styles.iconMr}
          />
          <Text style={styles.primaryBtnText}>Create Wallet</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={26} color={DARK.primary} />
      </TouchableOpacity>

      {/* Step indicator */}
      <View style={styles.steps}>
        {(['generate', 'backup', 'confirm'] as Step[]).map((s, _i) => (
          <View
            key={s}
            style={[styles.stepDot, step === s && styles.stepDotActive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'generate' && renderGenerateStep()}
        {step === 'backup' && renderBackupStep()}
        {step === 'confirm' && renderConfirmStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { flexGrow: 1, padding: 24 },
  backBtn: { paddingHorizontal: 16, paddingTop: 8 },
  steps: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DARK.border,
  },
  stepDotActive: { backgroundColor: DARK.primary, width: 20 },
  stepContainer: { alignItems: 'center', paddingTop: 12 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DARK.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: DARK.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: DARK.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: DARK.subtle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: DARK.warningBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK.warning,
    padding: 14,
    marginBottom: 32,
    width: '100%',
  },
  warnIcon: { marginRight: 10, marginTop: 1 },
  warningText: { color: DARK.warning, fontSize: 14, flex: 1, lineHeight: 20 },
  seedCard: {
    backgroundColor: DARK.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DARK.border,
    width: '100%',
    marginBottom: 24,
    minHeight: 160,
    overflow: 'hidden',
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  seedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.card2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '46%',
  },
  seedIndex: { fontSize: 12, color: DARK.subtle, marginRight: 4, width: 18 },
  seedText: {
    fontSize: 14,
    color: DARK.text,
    fontFamily: 'monospace',
    flex: 1,
  },
  seedBlur: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  seedBlurText: { color: DARK.subtle, fontSize: 14 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK.border,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  checkRowActive: { borderColor: DARK.primary },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: DARK.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: DARK.primary, borderColor: DARK.primary },
  checkLabel: { flex: 1, color: DARK.text, fontSize: 14, lineHeight: 20 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    minHeight: 56,
    gap: 8,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  loader: { marginBottom: 16 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C1214',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DARK.error,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  errorText: { color: DARK.error, fontSize: 14, flex: 1 },
  iconMr: { marginRight: 8 },
});
