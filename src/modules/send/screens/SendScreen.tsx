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
import type { MainTabParamList } from '../../../app/navigation/MainNavigator';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#000000',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  border: '#38383A',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const isValidAddress = (a: string): boolean => EVM_RE.test(a.trim());

function truncate(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function calcFeeEth(gasPrice: string, gasLimit: string): number {
  const p = parseFloat(gasPrice);
  const l = parseFloat(gasLimit);
  if (isNaN(p) || isNaN(l)) return 0.0001;
  return (p * l) / 1e9; // gwei * units → ETH
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'address' | 'amount' | 'confirm' | 'success';
type Nav = BottomTabNavigationProp<MainTabParamList, 'Send'>;

const ORDERED: Step[] = ['address', 'amount', 'confirm'];
const STEP_LABELS = ['Recipient', 'Amount', 'Confirm'];

// ─── Inline sub-components ────────────────────────────────────────────────────
const ErrorRow: React.FC<{ msg: string }> = ({ msg }) => (
  <View style={s.errRow}>
    <Ionicons name="alert-circle" size={13} color={C.error} />
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
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <>
        {iconLeft && (
          <Ionicons
            name={iconLeft}
            size={18}
            color="#fff"
            style={s.btnIconLeft}
          />
        )}
        <Text style={s.primaryBtnText}>{label}</Text>
        {iconRight && (
          <Ionicons
            name={iconRight}
            size={18}
            color="#fff"
            style={s.btnIconRight}
          />
        )}
      </>
    )}
  </TouchableOpacity>
);

const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={s.backBtn} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name="arrow-back" size={16} color={C.subtle} />
    <Text style={s.backText}>Back</Text>
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
  const { activeWallet } = useWdkWallet();

  // ── Step ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('address');

  // ── Form values ──────────────────────────────────────────────────────────
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');

  // ── Remote data ──────────────────────────────────────────────────────────
  const [balance, setBalance] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<{
    gasPrice: string;
    gasLimit: string;
  } | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // ── QR scanner ───────────────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      const val = codes[0]?.value;
      if (!val) {
        return;
      }
      const raw = val.trim();
      // Support EIP-681: ethereum:0x...@chainId?...
      const addr = raw.startsWith('ethereum:')
        ? raw.split(':')[1]?.split('@')[0]?.split('?')[0] ?? raw
        : raw;
      if (isValidAddress(addr)) {
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
        'Camera Permission Required',
        'Enable camera access in Settings to scan QR codes.',
      );
    }
  }, []);

  // ── Fetch balance when entering amount step ───────────────────────────────
  useEffect(() => {
    if (step === 'amount' && activeWallet?.address && balance === null) {
      blockchainApi
        .getBalance(activeWallet.address)
        .then(d => setBalance(d.balance))
        .catch(() => setBalance('0'));
    }
  }, [step, activeWallet?.address, balance]);

  // ── Derived values ────────────────────────────────────────────────────────
  const stepIndex = ORDERED.indexOf(step);
  const feeEth = gasEstimate
    ? calcFeeEth(gasEstimate.gasPrice, gasEstimate.gasLimit)
    : null;
  const totalEth = feeEth !== null ? parseFloat(amount || '0') + feeEth : null;

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    const idx = ORDERED.indexOf(step);
    if (idx > 0) {
      setStep(ORDERED[idx - 1]);
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  // ── Step transitions ──────────────────────────────────────────────────────
  const goToAmount = useCallback(() => {
    const addr = toAddress.trim();
    if (!isValidAddress(addr)) {
      setAddressError('Enter a valid Ethereum address starting with 0x.');
      return;
    }
    if (addr.toLowerCase() === activeWallet?.address?.toLowerCase()) {
      setAddressError("You can't send to your own wallet address.");
      return;
    }
    setAddressError('');
    setStep('amount');
  }, [toAddress, activeWallet?.address]);

  const goToConfirm = useCallback(async () => {
    const n = parseFloat(amount);
    const bal = parseFloat(balance ?? '0');
    if (isNaN(n) || n <= 0) {
      setAmountError('Enter a valid amount greater than 0.');
      return;
    }
    if (n > bal) {
      setAmountError('Insufficient balance.');
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
      const fee = calcFeeEth(est.gasPrice, est.gasLimit);
      if (n + fee > bal) {
        setAmountError('Amount + network fee exceeds your available balance.');
        setFeeLoading(false);
        return;
      }
    } catch {
      // Fallback: 20 Gwei × 21 000 gas ≈ 0.00042 ETH
      setGasEstimate({ gasPrice: '20', gasLimit: '21000' });
    } finally {
      setFeeLoading(false);
    }
    setStep('confirm');
  }, [amount, balance, toAddress, activeWallet]);

  const handleSend = useCallback(async () => {
    if (!activeWallet?.address) {
      return;
    }
    setSending(true);
    try {
      const result = await blockchainApi.sendTransaction(
        activeWallet.address,
        toAddress,
        amount,
        '', // Signing via WDK keychain — secure integration point
      );
      setTxHash(result.hash);
      setStep('success');
    } catch {
      Alert.alert(
        'Transaction Failed',
        'Could not broadcast the transaction. Check your connection and try again.',
      );
    } finally {
      setSending(false);
    }
  }, [activeWallet, toAddress, amount]);

  const pasteAddress = useCallback(async () => {
    const text = await Clipboard.getString();
    if (text?.trim()) {
      setToAddress(text.trim());
      setAddressError('');
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      {/* ── QR Scanner Overlay ─────────────────────────────────────────── */}
      {scanning && device && (
        <View style={s.scannerOverlay}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={scanning}
            codeScanner={codeScanner}
          />
          {/* Dimmed mask with transparent cut-out window */}
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
              <Text style={s.scanHint}>Align the QR code within the frame</Text>
              <TouchableOpacity
                onPress={() => setScanning(false)}
                style={s.scanCloseBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close-circle" size={48} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Step progress indicator ────────────────────────────────────── */}
        {step !== 'success' && (
          <View style={s.progress}>
            {STEP_LABELS.map((label, i) => (
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
                      <Ionicons name="checkmark" size={12} color="#fff" />
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
                {i < STEP_LABELS.length - 1 && (
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
          {/* ── STEP: ADDRESS ─────────────────────────────────────────── */}
          {step === 'address' && (
            <>
              <Text style={s.title}>Recipient</Text>
              <Text style={s.subtitle}>
                Enter or scan the Ethereum address you want to send to.
              </Text>

              <View style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.fieldLabel}>To address</Text>
                  <View style={s.rowEnd}>
                    <TouchableOpacity style={s.pill} onPress={pasteAddress}>
                      <Ionicons
                        name="clipboard-outline"
                        size={13}
                        color={C.primary}
                      />
                      <Text style={s.pillText}>Paste</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.pill, s.pillScan]}
                      onPress={openScanner}
                    >
                      <Ionicons
                        name="scan-outline"
                        size={13}
                        color={C.primary}
                      />
                      <Text style={s.pillText}>Scan QR</Text>
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
                  placeholder="0x4Ab3..."
                  placeholderTextColor={C.subtle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  returnKeyType="done"
                />
                {!!addressError && <ErrorRow msg={addressError} />}
              </View>

              <PrimaryButton
                label="Continue"
                iconRight="arrow-forward"
                onPress={goToAmount}
              />
            </>
          )}

          {/* ── STEP: AMOUNT ──────────────────────────────────────────── */}
          {step === 'amount' && (
            <>
              <Text style={s.title}>Amount</Text>
              <Text style={s.subtitle}>
                How much ETH would you like to send?
              </Text>

              <View style={s.recipientPreview}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={C.subtle}
                />
                <Text style={s.recipientAddr}>{truncate(toAddress)}</Text>
              </View>

              <View style={s.card}>
                <View style={s.rowBetween}>
                  <Text style={s.fieldLabel}>Amount (ETH)</Text>
                  {balance !== null && (
                    <TouchableOpacity
                      style={s.pill}
                      onPress={() => {
                        setAmount(balance);
                        setAmountError('');
                      }}
                    >
                      <Text style={s.pillText}>MAX</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={s.amountWrap}>
                  <TextInput
                    style={[s.amountInput, !!amountError && s.inputErr]}
                    value={amount}
                    onChangeText={t => {
                      setAmount(t.replace(/[^0-9.]/g, ''));
                      setAmountError('');
                    }}
                    placeholder="0.0"
                    placeholderTextColor={C.subtle}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    autoFocus
                  />
                  <Text style={s.amountUnit}>ETH</Text>
                </View>
                {balance === null ? (
                  <ActivityIndicator
                    size="small"
                    color={C.subtle}
                    style={s.balLoader}
                  />
                ) : (
                  <Text style={s.balHint}>
                    Available: {parseFloat(balance).toFixed(4)} ETH
                  </Text>
                )}
                {!!amountError && <ErrorRow msg={amountError} />}
              </View>

              <PrimaryButton
                label="Preview"
                iconRight="arrow-forward"
                onPress={goToConfirm}
                loading={feeLoading}
              />
              <BackButton onPress={goBack} />
            </>
          )}

          {/* ── STEP: CONFIRM ─────────────────────────────────────────── */}
          {step === 'confirm' && (
            <>
              <Text style={s.title}>Confirm</Text>
              <Text style={s.subtitle}>
                Review your transaction carefully before sending.
              </Text>

              <View style={s.summaryCard}>
                <SummaryRow label="To" value={toAddress} mono />
                <SummaryDivider />
                <SummaryRow
                  label="Amount"
                  value={`${parseFloat(amount).toFixed(4)} ETH`}
                  bold
                />
                <SummaryDivider />
                <SummaryRow
                  label="Network Fee"
                  value={
                    feeEth !== null
                      ? `~${feeEth.toFixed(6)} ETH`
                      : 'Calculating…'
                  }
                />
                <SummaryDivider />
                <SummaryRow
                  label="Total"
                  value={totalEth !== null ? `${totalEth.toFixed(6)} ETH` : '—'}
                  bold
                  accent
                />
              </View>

              <View style={s.warnBox}>
                <Ionicons name="warning-outline" size={14} color={C.warning} />
                <Text style={s.warnText}>
                  Transactions are irreversible. Verify the address before
                  confirming.
                </Text>
              </View>

              <PrimaryButton
                label="Send Now"
                iconLeft="send"
                onPress={handleSend}
                loading={sending}
              />
              <BackButton onPress={goBack} />
            </>
          )}

          {/* ── STEP: SUCCESS ─────────────────────────────────────────── */}
          {step === 'success' && (
            <View style={s.successWrap}>
              <View style={s.successCircle}>
                <Ionicons name="checkmark-circle" size={72} color={C.success} />
              </View>
              <Text style={s.successTitle}>Sent!</Text>
              <Text style={s.successSub}>
                Your transaction has been broadcast to the network.
              </Text>
              {txHash && (
                <View style={s.hashCard}>
                  <Text style={s.hashLabel}>Transaction Hash</Text>
                  <Text style={s.hashValue} selectable>
                    {txHash}
                  </Text>
                </View>
              )}
              <PrimaryButton
                label="Done"
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
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },

  // ── Step progress ──────────────────────────────────────────────────────────
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  progressItem: { alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.cardAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { borderColor: C.primary, backgroundColor: '#0A84FF18' },
  dotDone: { backgroundColor: C.primary, borderColor: C.primary },
  dotNum: { fontSize: 12, color: C.subtle, fontWeight: '600' },
  dotNumActive: { color: C.primary },
  dotLabel: {
    fontSize: 10,
    color: C.subtle,
    marginTop: 4,
    fontWeight: '500',
  },
  dotLabelActive: { color: C.primary },
  connector: {
    flex: 1,
    height: 1.5,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  connectorActive: { backgroundColor: C.primary },

  // ── Step headings ──────────────────────────────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: C.subtle,
    marginBottom: 20,
    lineHeight: 20,
  },

  // ── Recipient preview (amount step) ───────────────────────────────────────
  recipientPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  recipientAddr: {
    fontSize: 13,
    color: C.subtle,
    fontFamily: 'monospace',
    marginLeft: 8,
  },

  // ── Input card ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowEnd: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.subtle,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A84FF14',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#0A84FF40',
  },
  pillScan: { marginLeft: 6 },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: C.cardAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 48,
  },
  inputErr: { borderColor: C.error },
  amountWrap: { flexDirection: 'row', alignItems: 'center' },
  amountInput: {
    flex: 1,
    backgroundColor: C.cardAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 32,
    fontWeight: '600',
    height: 64,
  },
  amountUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: C.subtle,
    marginLeft: 10,
  },
  balLoader: { marginTop: 8 },
  balHint: { fontSize: 12, color: C.subtle, marginTop: 8 },

  // ── Validation error ───────────────────────────────────────────────────────
  errRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  errText: { fontSize: 12, color: C.error, marginLeft: 5, flex: 1 },

  // ── Confirm summary ────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: 13, color: C.subtle, flex: 1 },
  summaryValue: { fontSize: 14, color: C.text, flex: 2, textAlign: 'right' },
  summaryMono: { fontFamily: 'monospace', fontSize: 12, lineHeight: 18 },
  summaryBold: { fontWeight: '700' },
  summaryAccent: { color: C.primary, fontWeight: '700', fontSize: 16 },
  summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: 8 },

  // ── Warning ────────────────────────────────────────────────────────────────
  warnBox: {
    flexDirection: 'row',
    backgroundColor: '#FF9F0A12',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF9F0A40',
    padding: 12,
    marginBottom: 20,
  },
  warnText: {
    fontSize: 12,
    color: C.warning,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },

  // ── Buttons ────────────────────────────────────────────────────────────────
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  btnIconLeft: { marginRight: 8 },
  btnIconRight: { marginLeft: 8 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backText: { fontSize: 15, color: C.subtle, marginLeft: 5 },

  // ── Success ────────────────────────────────────────────────────────────────
  successWrap: { alignItems: 'center', paddingTop: 40 },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#30D15812',
    borderWidth: 1,
    borderColor: '#30D15840',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: C.text,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 15,
    color: C.subtle,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  hashCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 24,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.subtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  hashValue: {
    fontSize: 12,
    color: C.text,
    fontFamily: 'monospace',
    lineHeight: 18,
  },

  // ── QR Scanner overlay ────────────────────────────────────────────────────
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
    borderColor: C.primary,
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
    paddingTop: 24,
    gap: 20,
  },
  scanHint: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  scanCloseBtn: { padding: 4 },
});
