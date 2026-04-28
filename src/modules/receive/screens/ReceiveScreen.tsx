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
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { ReceiveStrings } from '../../../constants/strings';

const QR_SIZE = 220;

export const ReceiveScreen: React.FC = () => {
  const { activeWallet } = useWdkWallet();
  const address = activeWallet?.address ?? '';

  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (!address) {
      Alert.alert(
        ReceiveStrings.alerts.noAddressTitle,
        ReceiveStrings.alerts.noAddressMessage,
      );
      return;
    }
    Clipboard.setString(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [address]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.subtitle}>{ReceiveStrings.subtitle}</Text>

        {/* QR card */}
        <View style={s.qrCard}>
          {address ? (
            <QRCode
              value={address}
              size={QR_SIZE}
              backgroundColor={darkPalette.card}
              color={darkPalette.text}
              ecl="M"
            />
          ) : (
            <View style={s.qrPlaceholder}>
              <Ionicons
                name="wallet-outline"
                size={48}
                color={darkPalette.subtle}
              />
              <Text style={s.qrPlaceholderText}>
                {ReceiveStrings.qrPlaceholderText}
              </Text>
            </View>
          )}
        </View>

        {/* Full address */}
        {address ? (
          <View style={s.addressCard}>
            <Text style={s.addressLabel}>
              {ReceiveStrings.addressCard.label}
            </Text>
            <Text style={s.addressFull} selectable>
              {address}
            </Text>
          </View>
        ) : null}

        {/* Copy button */}
        <TouchableOpacity
          style={[s.copyBtn, copied && s.copyBtnDone]}
          onPress={copyAddress}
          activeOpacity={0.78}
          disabled={!address}
        >
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={20}
            color={copied ? darkPalette.success : darkPalette.primary}
          />
          <Text style={[s.copyBtnText, copied && s.copyBtnTextDone]}>
            {copied
              ? ReceiveStrings.copyBtn.done
              : ReceiveStrings.copyBtn.default}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkPalette.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  subtitle: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },

  qrCard: {
    backgroundColor: darkPalette.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: darkPalette.primary,
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
  qrPlaceholderText: { ...typography.bodySmall, color: darkPalette.subtle },

  addressCard: {
    width: '100%',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  addressLabel: {
    ...typography.overline,
    color: darkPalette.subtle,
    marginBottom: spacing.sm,
  },
  addressFull: {
    ...typography.mono,
    color: darkPalette.text,
    lineHeight: 20,
  },

  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: darkPalette.primaryFaint,
    borderWidth: 1,
    borderColor: darkPalette.primaryBorder,
  },
  copyBtnDone: {
    backgroundColor: darkPalette.successFaint,
    borderColor: darkPalette.successBorder,
  },
  copyBtnText: {
    ...typography.labelLarge,
    color: darkPalette.primary,
  },
  copyBtnTextDone: { color: darkPalette.success },
});
