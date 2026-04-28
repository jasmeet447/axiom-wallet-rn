import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useWdkWallet } from '../../wallet/hooks/useWdkWallet';
import { blockchainApi } from '../../../core/api/blockchainApi';
import { wdkService } from '../../../core/api/wdkService';
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { SendStrings } from '../../../constants/strings';
import {
  truncateAddress,
  isValidEVMAddress,
  calcFeeETH,
} from '../../../core/utils/formatters';
import type { MainTabParamList } from '../../../app/navigation/MainNavigator';

// ─── Helpers ──────────────────────────────────────────────────────────────────
type Step = 'address' | 'amount' | 'confirm' | 'success';
type Nav = BottomTabNavigationProp<MainTabParamList, 'Send'>;

const ORDERED: Step[] = ['address', 'amount', 'confirm'];

// ─── Inline sub-components ────────────────────────────────────────────────────
const ErrorRow: React.FC<{ msg: string }> = ({ msg }) => (
  <View style={s.errRow}>
    <Ionicons name="alert-circle" size={13} color={darkPalette.error} />
    <Text style={s.errText}>{msg}</Text>
  </View>
);

interface PrimaryButtonProps {
  label: string;
  iconLeft?: string;
  iconRight?: string;
  onPress: () => void;
  loading?: boolean;
}
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  iconLeft,
  iconRight,
  onPress,
  loading,
}) => (
  <TouchableOpacity
    style={[s.primaryBtn, loading && s.primaryBtnDisabled]}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color={darkPalette.text} size="small" />
    ) : (
      <>
        {iconLeft && (
          <Ionicons
            name={iconLeft}
            size={18}
            color={darkPalette.text}
            style={s.btnIconLeft}
          />
        )}
        <Text style={s.primaryBtnText}>{label}</Text>
        {iconRight && (
          <Ionicons
            name={iconRight}
            size={18}
            color={darkPalette.text}
            style={s.btnIconRight}
          />
        )}
      </>
    )}
  </TouchableOpacity>
);

const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={s.backBtn} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name="arrow-back" size={16} color={darkPalette.subtle} />
    <Text style={s.backText}>{SendStrings.stepLabels[0]}</Text>
  </TouchableOpacity>
);

interface SummaryRowProps {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  accent?: boolean;
}
const SummaryRow: React.FC<SummaryRowProps> = ({
  label,
  value,
  mono,
  bold,
  accent,
}) => (
  <View style={s.summaryRow}>
    <Text style={s.summaryLabel}>{label}</Text>
    <Text
      style={[
        s.summaryValue,
        mono && s.summaryMono,
        bold && s.summaryBold,
        accent && s.summaryAccent,
      ]}
      numberOfLines={mono ? 3 : 1}
      adjustsFontSizeToFit={!mono}
    >
      {value}
    </Text>
  </View>
);

const SummaryDivider: React.FC = () => <View style={s.summaryDivider} />;

// ─── SendScreen ───────────────────────────────────────────────────────────────
export const SendScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { activeWallet, activeWalletId } = useWdkWallet();

  const [step, setStep] = useState<Step>('address');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');

  const [balance, setBalance] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<{
    gasPrice: string;
    gasLimit: string;
  } | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      const val = codes[0]?.value;
      if (!val) return;
      const raw = val.trim();
      const addr = raw.startsWith('ethereum:')
        ? raw.split(':')[1]?.split('@')[0]?.split('?')[0] ?? raw
        : raw;
      if (isValidEVMAddress(addr)) {
        setToAddress(addr);
        setAddressError('');
        setScanning(false);
      }
    },
  });

  const openScanner = useCallback(async () => {
    const status = await Camera.requestCameraPermission();
    if (status === 'granted') {
      setScanning(true);
    } else {
      Alert.alert(
        SendStrings.scanner.cameraPermissionTitle,
        SendStrings.scanner.cameraPermissionMessage,
      );
    }
  }, []);

  // Fetch balance + pre-load gas estimate when reaching the amount step
  useEffect(() => {
    if (step === 'amount' && activeWallet?.address) {
      if (balance === null) {
        blockchainApi
          .getBalance(activeWallet.address)
          .then(d => setBalance(d.balance))
          .catch(() => setBalance('0'));
      }
      // Pre-fetch gas in background so MAX button is accurate
      if (!gasEstimate && toAddress) {
        blockchainApi
          .estimateGas(activeWallet.address, toAddress, '0')
          .then(est => setGasEstimate(est))
          .catch(() => {}); // will retry on goToConfirm
      }
    }
  }, [step, activeWallet?.address, balance, gasEstimate, toAddress]);

  const stepIndex = ORDERED.indexOf(step);
  const feeEth = gasEstimate
    ? calcFeeETH(gasEstimate.gasPrice, gasEstimate.gasLimit)
    : null;
  const totalEth = feeEth !== null ? parseFloat(amount || '0') + feeEth : null;

  const goBack = useCallback(() => {
    const idx = ORDERED.indexOf(step);
    if (idx > 0) {
      setStep(ORDERED[idx - 1]);
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const goToAmount = useCallback(() => {
    const addr = toAddress.trim();
    if (!isValidEVMAddress(addr)) {
      setAddressError(SendStrings.errors.invalidAddress);
      return;
    }
    if (addr.toLowerCase() === activeWallet?.address?.toLowerCase()) {
      setAddressError(SendStrings.errors.ownAddress);
      return;
    }
    setAddressError('');
    setStep('amount');
  }, [toAddress, activeWallet?.address]);

  const goToConfirm = useCallback(async () => {
    const n = parseFloat(amount);
    const bal = parseFloat(balance ?? '0');
    if (isNaN(n) || n <= 0) {
      setAmountError(SendStrings.errors.invalidAmount);
      return;
    }
    if (bal === 0) {
      setAmountError(SendStrings.errors.zeroBalance);
      return;
    }
    if (n > bal) {
      setAmountError(SendStrings.errors.insufficientBalance);
      return;
    }
    setAmountError('');
    setFeeLoading(true);
    try {
      const est = await blockchainApi.estimateGas(
        activeWallet!.address,
        toAddress,
        amount,
      );
      setGasEstimate(est);
      const fee = calcFeeETH(est.gasPrice, est.gasLimit);
      if (n + fee > bal) {
        setAmountError(SendStrings.errors.exceedsBalanceWithFee);
        setFeeLoading(false);
        return;
      }
    } catch {
      // Use a conservative fallback if the estimate call fails
      setGasEstimate({ gasPrice: '20', gasLimit: '21000' });
    } finally {
      setFeeLoading(false);
    }
    setStep('confirm');
  }, [amount, balance, toAddress, activeWallet]);

  /**
   * Sign and send the transaction.
   *
   * wdkService.signAndSendTransaction:
   *   1. Retrieves mnemonic from Keychain → triggers OS biometric prompt.
   *   2. Derives private key on-device (never transmitted).
   *   3. Signs the EVM transaction locally.
   *   4. Broadcasts only the signed bytes.
   */
  const handleSend = useCallback(async () => {
    if (!activeWallet?.address || !activeWalletId) return;
    setSending(true);
    try {
      const result = await wdkService.signAndSendTransaction(
        activeWalletId,
        toAddress,
        amount,
        gasEstimate?.gasPrice ?? '20',
        gasEstimate?.gasLimit ?? '21000',
      );
      setTxHash(result.hash);
      setStep('success');
    } catch (e: any) {
      const msg: string = e?.message ?? '';
      if (/cancel/i.test(msg)) {
        // User cancelled the biometric prompt — stay on confirm screen
        Alert.alert(SendStrings.txFailedTitle, SendStrings.txAuthCancelled);
      } else if (/network|connect|timeout/i.test(msg)) {
        Alert.alert(SendStrings.txFailedTitle, SendStrings.txNetworkError);
      } else if (/insufficient|balance/i.test(msg)) {
        Alert.alert(
          SendStrings.txFailedTitle,
          SendStrings.errors.insufficientBalance,
        );
      } else {
        Alert.alert(SendStrings.txFailedTitle, SendStrings.txFailedMessage);
      }
    } finally {
      setSending(false);
    }
  }, [activeWallet, activeWalletId, toAddress, amount, gasEstimate]);

  const pasteAddress = useCallback(async () => {
    const text = await Clipboard.getString();
    if (text?.trim()) {
      setToAddress(text.trim());
      setAddressError('');
    }
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      {/* QR Scanner Overlay */}
      {scanning && device && (
        <View style={s.scannerOverlay}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={scanning}
            codeScanner={codeScanner}
          />
          <View style={s.scanDim}>
            <View style={s.scanTop} />
            <View style={s.scanMiddle}>
              <View style={s.scanSide} />
              <View style={s.scanWindow}>
                <View style={[s.corner, s.cTL]} />
                <View style={[s.corner, s.cTR]} />
                <View style={[s.corner, s.cBL]} />
                <View style={[s.corner, s.cBR]} />
              </View>
              <View style={s.scanSide} />
            </View>
            <View style={s.scanBottom}>
              <Text style={s.scanHint}>{SendStrings.scanner.hint}</Text>
              <TouchableOpacity
                onPress={() => setScanning(false)}
                style={s.scanCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name="close-circle"
                  size={48}
                  color={darkPalette.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Step progress indicator */}
        {step !== 'success' && (
          <View style={s.progress}>
            {SendStrings.stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <View style={s.progressItem}>
                  <View
                    style={[
                      s.dot,
                      stepIndex >= i && s.dotActive,
                      stepIndex > i && s.dotDone,
                    ]}
                  >
                    {stepIndex > i ? (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={darkPalette.text}
                      />
                    ) : (
                      <Text
                        style={[s.dotNum, stepIndex === i && s.dotNumActive]}
                      >
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[s.dotLabel, stepIndex === i && s.dotLabelActive]}
                  >
                    {label}
                  </Text>
                </View>
                {i < SendStrings.stepLabels.length - 1 && (
                  <View
                    style={[s.connector, stepIndex > i && s.connectorActive]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* STEP: ADDRESS */}
          {step === 'address' && (
            <>
              <Text style={s.title}>{SendStrings.address.title}</Text>
              <Text style={s.subtitle}>{SendStrings.address.subtitle}</Text>

              <View style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.fieldLabel}>
                    {SendStrings.address.fieldLabel}
                  </Text>
                  <View style={s.rowEnd}>
                    <TouchableOpacity style={s.pill} onPress={pasteAddress}>
                      <Ionicons
                        name="clipboard-outline"
                        size={13}
                        color={darkPalette.primary}
                      />
                      <Text style={s.pillText}>
                        {SendStrings.address.paste}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.pill, s.pillScan]}
                      onPress={openScanner}
                    >
                      <Ionicons
                        name="scan-outline"
                        size={13}
                        color={darkPalette.primary}
                      />
                      <Text style={s.pillText}>
                        {SendStrings.address.scanQr}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  style={[s.input, !!addressError && s.inputErr]}
                  value={toAddress}
                  onChangeText={t => {
                    setToAddress(t);
                    setAddressError('');
                  }}
                  placeholder={SendStrings.address.placeholder}
                  placeholderTextColor={darkPalette.subtle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  returnKeyType="done"
                />
                {!!addressError && <ErrorRow msg={addressError} />}
              </View>

              <PrimaryButton
                label={SendStrings.address.continueBtn}
                iconRight="arrow-forward"
                onPress={goToAmount}
              />
            </>
          )}

          {/* STEP: AMOUNT */}
          {step === 'amount' && (
            <>
              <Text style={s.title}>{SendStrings.amount.title}</Text>
              <Text style={s.subtitle}>{SendStrings.amount.subtitle}</Text>

              <View style={s.recipientPreview}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={darkPalette.subtle}
                />
                <Text style={s.recipientAddr}>
                  {truncateAddress(toAddress)}
                </Text>
              </View>

              <View style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.fieldLabel}>
                    {SendStrings.amount.fieldLabel}
                  </Text>
                  {balance !== null && (
                    <TouchableOpacity
                      style={s.pill}
                      onPress={() => {
                        // MAX = balance minus estimated fee (or a small buffer
                        // if the estimate hasn't loaded yet)
                        const fee =
                          feeEth !== null ? feeEth : calcFeeETH('20', '21000'); // conservative fallback
                        const bal = parseFloat(balance ?? '0');
                        const maxSend = Math.max(0, bal - fee);
                        setAmount(maxSend > 0 ? maxSend.toFixed(6) : '0');
                        setAmountError('');
                      }}
                    >
                      <Text style={s.pillText}>
                        {SendStrings.amount.maxBtn}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={s.amountWrap}>
                  <TextInput
                    style={[s.amountInput, !!amountError && s.inputErr]}
                    value={amount}
                    onChangeText={t => {
                      // Strip non-numeric characters except one decimal point
                      const stripped = t.replace(/[^0-9.]/g, '');
                      const firstDot = stripped.indexOf('.');
                      const safe =
                        firstDot === -1
                          ? stripped
                          : stripped.slice(0, firstDot + 1) +
                            stripped.slice(firstDot + 1).replace(/\./g, '');
                      setAmount(safe);
                      setAmountError('');
                    }}
                    placeholder={SendStrings.amount.placeholder}
                    placeholderTextColor={darkPalette.subtle}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    autoFocus
                  />
                  <Text style={s.amountUnit}>ETH</Text>
                </View>
                {balance === null ? (
                  <ActivityIndicator
                    size="small"
                    color={darkPalette.subtle}
                    style={s.balLoader}
                  />
                ) : (
                  <Text style={s.balHint}>
                    {SendStrings.amount.availableBalance}{' '}
                    {parseFloat(balance).toFixed(4)} ETH
                    {feeEth !== null
                      ? `  ·  ${
                          SendStrings.amount.estimatedFee
                        }${feeEth.toFixed(6)} ETH`
                      : ''}
                  </Text>
                )}
                {!!amountError && <ErrorRow msg={amountError} />}
              </View>

              <PrimaryButton
                label={SendStrings.amount.continueBtn}
                iconRight="arrow-forward"
                onPress={goToConfirm}
                loading={feeLoading}
              />
              <BackButton onPress={goBack} />
            </>
          )}

          {/* STEP: CONFIRM */}
          {step === 'confirm' && (
            <>
              <Text style={s.title}>{SendStrings.confirm.title}</Text>
              <Text style={s.subtitle}>{SendStrings.confirm.subtitle}</Text>

              <View style={s.summaryCard}>
                <SummaryRow
                  label={SendStrings.confirm.rows.to}
                  value={toAddress}
                  mono
                />
                <SummaryDivider />
                <SummaryRow
                  label={SendStrings.confirm.rows.amount}
                  value={`${parseFloat(amount).toFixed(4)} ETH`}
                  bold
                />
                <SummaryDivider />
                <SummaryRow
                  label={SendStrings.confirm.rows.networkFee}
                  value={
                    feeEth !== null
                      ? `~${feeEth.toFixed(6)} ETH`
                      : 'Calculating…'
                  }
                />
                <SummaryDivider />
                <SummaryRow
                  label={SendStrings.confirm.rows.total}
                  value={totalEth !== null ? `${totalEth.toFixed(6)} ETH` : '—'}
                  bold
                  accent
                />
              </View>

              <View style={s.warnBox}>
                <Ionicons
                  name="warning-outline"
                  size={14}
                  color={darkPalette.warning}
                />
                <Text style={s.warnText}>
                  {SendStrings.confirm.securityNote}
                </Text>
              </View>

              <View style={s.biometricNoteBox}>
                <Ionicons
                  name="finger-print"
                  size={14}
                  color={darkPalette.subtle}
                />
                <Text style={s.biometricNoteText}>
                  {SendStrings.confirm.biometricNote}
                </Text>
              </View>

              <PrimaryButton
                label={SendStrings.confirm.sendBtn}
                iconLeft="send"
                onPress={handleSend}
                loading={sending}
              />
              <BackButton onPress={goBack} />
            </>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <View style={s.successWrap}>
              <View style={s.successCircle}>
                <Ionicons
                  name="checkmark-circle"
                  size={72}
                  color={darkPalette.success}
                />
              </View>
              <Text style={s.successTitle}>{SendStrings.success.title}</Text>
              <Text style={s.successSub}>{SendStrings.success.subtitle}</Text>
              {txHash && (
                <View style={s.hashCard}>
                  <Text style={s.hashLabel}>
                    {SendStrings.success.txHashLabel}
                  </Text>
                  <Text style={s.hashValue} selectable>
                    {txHash}
                  </Text>
                </View>
              )}
              <PrimaryButton
                label={SendStrings.success.doneBtn}
                iconLeft="checkmark"
                onPress={() => navigation.navigate('Home')}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkPalette.bg },
  flex: { flex: 1 },
  scroll: { padding: spacing.md + 4, paddingBottom: 48 },

  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: darkPalette.border,
  },
  progressItem: { alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: darkPalette.cardAlt,
    borderWidth: 1.5,
    borderColor: darkPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: darkPalette.primary,
    backgroundColor: darkPalette.primaryFaint,
  },
  dotDone: {
    backgroundColor: darkPalette.primary,
    borderColor: darkPalette.primary,
  },
  dotNum: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    fontWeight: '600',
  },
  dotNumActive: { color: darkPalette.primary },
  dotLabel: {
    ...typography.caption,
    color: darkPalette.subtle,
    marginTop: 4,
    fontWeight: '500',
  },
  dotLabelActive: { color: darkPalette.primary },
  connector: {
    flex: 1,
    height: 1.5,
    backgroundColor: darkPalette.border,
    marginBottom: 14,
  },
  connectorActive: { backgroundColor: darkPalette.primary },

  title: { ...typography.h2, color: darkPalette.text, marginBottom: 6 },
  subtitle: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  recipientPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: darkPalette.border,
    marginBottom: spacing.md,
  },
  recipientAddr: {
    ...typography.mono,
    color: darkPalette.subtle,
    marginLeft: spacing.sm,
  },

  card: {
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowEnd: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: { ...typography.overline, color: darkPalette.subtle },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.primaryFaint,
    borderRadius: borderRadius.sm + 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: darkPalette.primaryMid,
  },
  pillScan: { marginLeft: 6 },
  pillText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: darkPalette.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: darkPalette.cardAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: darkPalette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: darkPalette.text,
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 48,
  },
  inputErr: { borderColor: darkPalette.error },
  amountWrap: { flexDirection: 'row', alignItems: 'center' },
  amountInput: {
    flex: 1,
    backgroundColor: darkPalette.cardAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: darkPalette.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: darkPalette.text,
    fontSize: 32,
    fontWeight: '600',
    height: 64,
  },
  amountUnit: {
    ...typography.numericLG,
    color: darkPalette.subtle,
    marginLeft: 10,
  },
  balLoader: { marginTop: spacing.sm },
  balHint: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    marginTop: spacing.sm,
  },

  errRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  errText: {
    ...typography.bodySmall,
    color: darkPalette.error,
    marginLeft: 5,
    flex: 1,
  },

  summaryCard: {
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  summaryLabel: { ...typography.bodySmall, color: darkPalette.subtle, flex: 1 },
  summaryValue: {
    ...typography.bodyMedium,
    color: darkPalette.text,
    flex: 2,
    textAlign: 'right',
  },
  summaryMono: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  summaryBold: { fontWeight: '700' },
  summaryAccent: {
    color: darkPalette.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: darkPalette.border,
    marginVertical: spacing.sm,
  },

  warnBox: {
    flexDirection: 'row',
    backgroundColor: darkPalette.warning + '12',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: darkPalette.warning + '40',
    padding: 12,
    marginBottom: spacing.sm,
  },
  warnText: {
    ...typography.bodySmall,
    color: darkPalette.warning,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  biometricNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.primaryFaint,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: darkPalette.primaryBorder,
    padding: 10,
    marginBottom: spacing.lg,
  },
  biometricNoteText: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { ...typography.labelLarge, color: darkPalette.text },
  btnIconLeft: { marginRight: spacing.sm },
  btnIconRight: { marginLeft: spacing.sm },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  backText: {
    ...typography.bodyMedium,
    color: darkPalette.subtle,
    marginLeft: 5,
  },

  successWrap: { alignItems: 'center', paddingTop: 40 },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: darkPalette.successFaint,
    borderWidth: 1,
    borderColor: darkPalette.successBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.displayLarge,
    color: darkPalette.text,
    marginBottom: spacing.sm,
  },
  successSub: {
    ...typography.bodyMedium,
    color: darkPalette.subtle,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  hashCard: {
    width: '100%',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  hashLabel: {
    ...typography.overline,
    color: darkPalette.subtle,
    marginBottom: spacing.sm,
  },
  hashValue: { ...typography.mono, color: darkPalette.text, lineHeight: 18 },

  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  scanDim: { flex: 1 },
  scanTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  scanMiddle: { flexDirection: 'row', height: 260 },
  scanSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  scanWindow: { width: 260, height: 260 },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: darkPalette.primary,
    borderWidth: 3,
  },
  cTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  cTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  scanBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  scanHint: {
    ...typography.bodyMedium,
    color: darkPalette.text,
    fontWeight: '500',
  },
  scanCloseBtn: { padding: 4 },
});
