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

import { biometricService } from '../../../core/biometric/biometricService';
import { useAppDispatch } from '../../../store/hooks';
import {
  setAuthenticated,
  setUnlocked,
  setUser,
} from '../../../store/slices/authSlice';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

const DARK = {
  bg: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  success: '#30D158',
  error: '#FF453A',
  errorBg: '#2C1214',
  border: '#38383A',
  inputBg: '#2C2C2E',
};

type Props = NativeStackScreenProps<AuthStackParamList, 'ImportWallet'>;

const VALID_WORD_COUNTS = [12, 24];

function normalisePhrase(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
}

export const ImportWalletScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [phraseInput, setPhraseInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const words = normalisePhrase(phraseInput);
  const wordCount = words.length;

  const isValidWordCount =
    wordCount === 0 || VALID_WORD_COUNTS.includes(wordCount);
  const canSubmit = VALID_WORD_COUNTS.includes(wordCount) && !isLoading;

  const wordCountColor =
    wordCount === 0
      ? DARK.subtle
      : VALID_WORD_COUNTS.includes(wordCount)
      ? DARK.success
      : DARK.error;

  const handleImport = useCallback(async () => {
    if (!canSubmit) return;
    setError(null);
    setIsLoading(true);

    try {
      // Join back to a canonical space-separated phrase before storing
      const canonicalPhrase = words.join(' ');

      // In production: validate each word against the BIP39 wordlist here

      const stored = await biometricService.setupWallet(canonicalPhrase);
      if (!stored) {
        setError(
          'Failed to secure your wallet. Please check biometric settings and try again.',
        );
        return;
      }
      setSuccess(true);
      // Allow a brief success flash before dispatching
      await new Promise<void>(resolve => setTimeout(resolve, 600));
      dispatch(setUser({ id: 'wallet', isSetup: true }));
      dispatch(setAuthenticated(true));
      dispatch(setUnlocked(true));
    } catch (e: any) {
      setError(e?.message ?? 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, words, dispatch]);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={DARK.primary} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.iconWrap}>
            <Ionicons name="download" size={48} color={DARK.primary} />
          </View>
          <Text style={styles.title}>Import Wallet</Text>
          <Text style={styles.subtitle}>
            Enter your 12 or 24-word secret recovery phrase. Words can be
            separated by spaces or commas.
          </Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Seed Phrase</Text>
              <Text style={[styles.wordCount, { color: wordCountColor }]}>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
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
              placeholder="Enter your seed phrase…"
              placeholderTextColor={DARK.subtle}
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
                A seed phrase must be exactly 12 or 24 words.
              </Text>
            )}
          </View>

          {/* Error banner */}
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

          {/* Security note */}
          <View style={styles.securityNote}>
            <Ionicons
              name="shield"
              size={16}
              color={DARK.subtle}
              style={styles.iconMr}
            />
            <Text style={styles.securityNoteText}>
              Your phrase is encrypted locally and never transmitted.
            </Text>
          </View>

          {/* CTA */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={success ? DARK.success : DARK.primary}
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
                color="#FFF"
                style={styles.iconMr}
              />
              <Text style={styles.importBtnText}>Import Wallet</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  backBtn: { paddingHorizontal: 16, paddingTop: 8 },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DARK.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: DARK.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: DARK.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: DARK.subtle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: { fontSize: 14, fontWeight: '600', color: DARK.text },
  wordCount: { fontSize: 13, fontWeight: '500' },
  phraseInput: {
    backgroundColor: DARK.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK.border,
    color: DARK.text,
    fontSize: 15,
    padding: 14,
    minHeight: 120,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 22,
  },
  phraseInputError: { borderColor: DARK.error },
  phraseInputSuccess: { borderColor: DARK.success },
  inputHint: {
    marginTop: 6,
    fontSize: 12,
    color: DARK.error,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.errorBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DARK.error,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: DARK.error, fontSize: 14, flex: 1 },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  securityNoteText: { color: DARK.subtle, fontSize: 13, flex: 1 },
  loader: { marginBottom: 16 },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DARK.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    minHeight: 56,
  },
  btnDisabled: { opacity: 0.4 },
  importBtnText: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  iconMr: { marginRight: 8 },
});
