import React, { useCallback, useState } from 'react';
import {
  Alert,
  Clipboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWdkWallet } from '../../wallet/hooks/useWdkWallet';

// ─── Design tokens (consistent with Dashboard) ────────────────────────────────
const C = {
  bg: '#000000',
  card: '#1C1C1E',
  cardAlt: '#2C2C2E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  success: '#30D158',
  border: '#38383A',
};

const QR_SIZE = 220;

// ─── ReceiveScreen ────────────────────────────────────────────────────────────
export const ReceiveScreen: React.FC = () => {
  const { activeWallet } = useWdkWallet();
  const address = activeWallet?.address ?? '';

  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (!address) {
      Alert.alert('No address', 'No wallet address available to copy.');
      return;
    }
    Clipboard.setString(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [address]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        {/* ── Subtitle ───────────────────────────────── */}
        <Text style={s.subtitle}>
          Share this address to receive ETH or ERC-20 tokens.
        </Text>

        {/* ── QR card ────────────────────────────────── */}
        <View style={s.qrCard}>
          {address ? (
            <QRCode
              value={address}
              size={QR_SIZE}
              backgroundColor={C.card}
              color={C.text}
              ecl="M"
            />
          ) : (
            <View style={s.qrPlaceholder}>
              <Ionicons name="wallet-outline" size={48} color={C.subtle} />
              <Text style={s.qrPlaceholderText}>No wallet active</Text>
            </View>
          )}
        </View>

        {/* ── Full address ───────────────────────────── */}
        {address ? (
          <View style={s.addressCard}>
            <Text style={s.addressLabel}>Wallet Address</Text>
            <Text style={s.addressFull} selectable>
              {address}
            </Text>
          </View>
        ) : null}

        {/* ── Copy button ────────────────────────────── */}
        <TouchableOpacity
          style={[s.copyBtn, copied && s.copyBtnDone]}
          onPress={copyAddress}
          activeOpacity={0.78}
          disabled={!address}
        >
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={20}
            color={copied ? C.success : C.primary}
          />
          <Text style={[s.copyBtnText, copied && s.copyBtnTextDone]}>
            {copied ? 'Copied!' : 'Copy Address'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  subtitle: {
    fontSize: 14,
    color: C.subtle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    maxWidth: 280,
  },

  // QR
  qrCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    marginBottom: 24,
    // subtle glow
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  qrPlaceholder: {
    width: QR_SIZE,
    height: QR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  qrPlaceholderText: { color: C.subtle, fontSize: 14 },

  // Address
  addressCard: {
    width: '100%',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.subtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  addressFull: {
    fontSize: 13,
    color: C.text,
    fontFamily: 'monospace',
    lineHeight: 20,
  },

  // Copy button
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#0A84FF18',
    borderWidth: 1,
    borderColor: '#0A84FF60',
  },
  copyBtnDone: {
    backgroundColor: '#30D15818',
    borderColor: '#30D15860',
  },
  copyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.primary,
  },
  copyBtnTextDone: { color: C.success },
});
