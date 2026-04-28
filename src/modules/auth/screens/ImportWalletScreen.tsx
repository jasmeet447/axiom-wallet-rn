import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { normaliseSeedPhrase } from '../../../core/utils/formatters';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ImportWallet'>;

const VALID_WORD_COUNTS = [12, 24];

export const ImportWalletScreen: React.FC<Props> = ({ navigation }) => {
  const { importWallet } = useWdkWallet();
  const [phraseInput, setPhraseInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const words = normaliseSeedPhrase(phraseInput);
  const wordCount = words.length;

  const isValidWordCount =
    wordCount === 0 || VALID_WORD_COUNTS.includes(wordCount);
  const canSubmit = VALID_WORD_COUNTS.includes(wordCount) && !isLoading;

  const wordCountColor =
    wordCount === 0
      ? darkPalette.subtle
      : VALID_WORD_COUNTS.includes(wordCount)
      ? darkPalette.success
      : darkPalette.error;

  const handleImport = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setIsLoading(true);

    try {
      const canonicalPhrase = words.join(' ');
      await importWallet(
        AuthStrings.importWallet.defaultWalletName,
        canonicalPhrase,
      );
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message ?? CommonStrings.errors.unknown);
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, words, importWallet]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader onBack={() => navigation.goBack()} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <AppIconCircle iconName="download" iconSize={48} diameter={88} />
          <Text style={styles.title}>{AuthStrings.importWallet.title}</Text>
          <Text style={styles.subtitle}>
            {AuthStrings.importWallet.subtitle}
          </Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>
                {AuthStrings.importWallet.seedPhraseLabel}
              </Text>
              <Text style={[styles.wordCount, { color: wordCountColor }]}>
                {wordCount}{' '}
                {wordCount === 1
                  ? AuthStrings.importWallet.wordCountSingular
                  : AuthStrings.importWallet.wordCountPlural}
                {VALID_WORD_COUNTS.includes(wordCount) ? ' ✓' : ''}
              </Text>
            </View>
            <TextInput
              style={[
                styles.phraseInput,
                !isValidWordCount && wordCount > 0 && styles.phraseInputError,
                success && styles.phraseInputSuccess,
              ]}
              value={phraseInput}
              onChangeText={text => {
                setError(null);
                setPhraseInput(text);
              }}
              placeholder={AuthStrings.importWallet.seedPhrasePlaceholder}
              placeholderTextColor={darkPalette.subtle}
              multiline
              numberOfLines={5}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              editable={!isLoading && !success}
            />
            {!isValidWordCount && wordCount > 0 && (
              <Text style={styles.inputHint}>
                {AuthStrings.importWallet.invalidWordCount}
              </Text>
            )}
          </View>

          {error ? <ErrorBanner message={error} /> : null}

          {/* Security note */}
          <View style={styles.securityNote}>
            <Ionicons
              name="shield"
              size={16}
              color={darkPalette.subtle}
              style={styles.iconMr}
            />
            <Text style={styles.securityNoteText}>
              {AuthStrings.importWallet.securityNote}
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={success ? darkPalette.success : darkPalette.primary}
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity
              style={[styles.importBtn, !canSubmit && styles.btnDisabled]}
              onPress={handleImport}
              disabled={!canSubmit}
              activeOpacity={0.8}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color={darkPalette.text}
                style={styles.iconMr}
              />
              <Text style={styles.importBtnText}>
                {AuthStrings.importWallet.importBtn}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkPalette.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg },
  title: {
    ...typography.displayMedium,
    color: darkPalette.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: darkPalette.subtle,
    textAlign: 'center',
    marginBottom: 28,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inputLabel: { ...typography.labelMedium, color: darkPalette.text },
  wordCount: { ...typography.bodySmall },
  phraseInput: {
    backgroundColor: darkPalette.inputBg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    color: darkPalette.text,
    fontSize: 15,
    padding: 14,
    minHeight: 120,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 22,
  },
  phraseInputError: { borderColor: darkPalette.error },
  phraseInputSuccess: { borderColor: darkPalette.success },
  inputHint: {
    marginTop: 6,
    ...typography.bodySmall,
    color: darkPalette.error,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  securityNoteText: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    flex: 1,
  },
  loader: { marginBottom: spacing.md },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.xl - 2,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    width: '100%',
    minHeight: 56,
  },
  btnDisabled: { opacity: 0.4 },
  importBtnText: { ...typography.labelLarge, color: darkPalette.text },
  iconMr: { marginRight: spacing.sm },
});

