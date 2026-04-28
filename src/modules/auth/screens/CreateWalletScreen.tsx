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
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { AuthStrings, CommonStrings } from '../../../constants/strings';
import {
  AppIconCircle,
  ErrorBanner,
  ScreenHeader,
} from '../../../shared/components';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateWallet'>;

type Step = 'generate' | 'backup' | 'confirm';

export const CreateWalletScreen: React.FC<Props> = ({ navigation }) => {
  const { generateMnemonic, createWallet } = useWdkWallet();
  const [step, setStep] = useState<Step>('generate');
  const [mnemonic] = useState<string>(() => generateMnemonic());
  const [seedWords] = useState<string[]>(() => mnemonic.split(' '));
  const [revealed, setRevealed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await createWallet(AuthStrings.createWallet.defaultWalletName);
    } catch (e: any) {
      setError(e?.message ?? CommonStrings.errors.unknown);
    } finally {
      setIsLoading(false);
    }
  }, [createWallet]);

  const renderGenerateStep = () => (
    <View style={styles.stepContainer}>
      <AppIconCircle iconName="wallet" iconSize={52} diameter={96} />
      <Text style={styles.title}>{AuthStrings.createWallet.title}</Text>
      <Text style={styles.subtitle}>{AuthStrings.createWallet.subtitle}</Text>

      <View style={styles.warningCard}>
        <Ionicons
          name="warning"
          size={20}
          color={darkPalette.warning}
          style={styles.warnIcon}
        />
        <Text style={styles.warningText}>
          {AuthStrings.createWallet.warningMessage}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => setStep('backup')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>
          {AuthStrings.createWallet.viewSeedPhrase}
        </Text>
        <Ionicons name="arrow-forward" size={18} color={darkPalette.text} />
      </TouchableOpacity>
    </View>
  );

  const renderBackupStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>{AuthStrings.createWallet.backupTitle}</Text>
      <Text style={styles.subtitle}>
        {AuthStrings.createWallet.backupSubtitle}
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
            <Ionicons
              name="eye-off-outline"
              size={32}
              color={darkPalette.subtle}
            />
            <Text style={styles.seedBlurText}>
              {AuthStrings.createWallet.tapToReveal}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryBtn, !revealed && styles.btnDisabled]}
        onPress={() => revealed && setStep('confirm')}
        activeOpacity={0.8}
        disabled={!revealed}
      >
        <Text style={styles.primaryBtnText}>
          {AuthStrings.createWallet.iSavedIt}
        </Text>
        <Ionicons name="arrow-forward" size={18} color={darkPalette.text} />
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <AppIconCircle
        iconName="shield-checkmark"
        iconSize={52}
        diameter={96}
        iconColor={darkPalette.success}
      />
      <Text style={styles.title}>{AuthStrings.createWallet.confirmTitle}</Text>
      <Text style={styles.subtitle}>
        {AuthStrings.createWallet.confirmSubtitle}
      </Text>

      {error ? <ErrorBanner message={error} style={styles.fullWidth} /> : null}

      <TouchableOpacity
        style={[styles.checkRow, confirmed && styles.checkRowActive]}
        onPress={() => setConfirmed(c => !c)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
          {confirmed && (
            <Ionicons name="checkmark" size={14} color={darkPalette.text} />
          )}
        </View>
        <Text style={styles.checkLabel}>
          {AuthStrings.createWallet.confirmCheckboxLabel}
        </Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={darkPalette.primary}
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
            color={darkPalette.text}
            style={styles.iconMr}
          />
          <Text style={styles.primaryBtnText}>
            {AuthStrings.createWallet.createWalletBtn}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      {/* Step indicator */}
      <View style={styles.steps}>
        {(['generate', 'backup', 'confirm'] as Step[]).map(s => (
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
  safe: { flex: 1, backgroundColor: darkPalette.bg },
  scroll: { flexGrow: 1, padding: spacing.lg },
  steps: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: darkPalette.border,
  },
  stepDotActive: { backgroundColor: darkPalette.primary, width: 20 },
  stepContainer: { alignItems: 'center', paddingTop: 12 },
  fullWidth: { width: '100%' },
  title: {
    ...typography.displayMedium,
    color: darkPalette.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: darkPalette.subtle,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: darkPalette.warningBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.warning,
    padding: 14,
    marginBottom: spacing.xl,
    width: '100%',
  },
  warnIcon: { marginRight: 10, marginTop: 1 },
  warningText: {
    ...typography.bodySmall,
    color: darkPalette.warning,
    flex: 1,
    lineHeight: 20,
  },
  seedCard: {
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    width: '100%',
    marginBottom: spacing.lg,
    minHeight: 160,
    overflow: 'hidden',
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  seedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.cardAlt,
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '46%',
  },
  seedIndex: {
    ...typography.caption,
    color: darkPalette.subtle,
    marginRight: 4,
    width: 18,
  },
  seedText: {
    ...typography.mono,
    color: darkPalette.text,
    flex: 1,
  },
  seedBlur: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  seedBlurText: { ...typography.bodySmall, color: darkPalette.subtle },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 14,
    width: '100%',
    marginBottom: spacing.lg,
    gap: 12,
  },
  checkRowActive: { borderColor: darkPalette.primary },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: darkPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: darkPalette.primary,
    borderColor: darkPalette.primary,
  },
  checkLabel: {
    ...typography.bodySmall,
    flex: 1,
    color: darkPalette.text,
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.xl - 2,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    width: '100%',
    minHeight: 56,
    gap: spacing.sm,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { ...typography.labelLarge, color: darkPalette.text },
  loader: { marginBottom: spacing.md },
  iconMr: { marginRight: spacing.sm },
});

