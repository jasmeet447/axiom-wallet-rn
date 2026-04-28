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
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { AuthStrings } from '../../../constants/strings';
import type { AuthStackParamList } from '../../../app/navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Setup'>;

export const SetupScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Ionicons name="diamond" size={56} color={darkPalette.primary} />
          </View>
          <Text style={styles.appName}>{AuthStrings.setup.appName}</Text>
          <Text style={styles.tagline}>{AuthStrings.setup.tagline}</Text>
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
              color={darkPalette.text}
              style={styles.btnIcon}
            />
            <View>
              <Text style={styles.btnTitle}>
                {AuthStrings.setup.createWallet}
              </Text>
              <Text style={styles.btnSubtitle}>
                {AuthStrings.setup.createWalletSubtitle}
              </Text>
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
              color={darkPalette.primary}
              style={styles.btnIcon}
            />
            <View>
              <Text style={[styles.btnTitle, { color: darkPalette.primary }]}>
                {AuthStrings.setup.importWallet}
              </Text>
              <Text style={styles.btnSubtitle}>
                {AuthStrings.setup.importWalletSubtitle}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>{AuthStrings.setup.footer}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkPalette.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: darkPalette.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: darkPalette.border,
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.displayLarge,
    color: darkPalette.text,
    letterSpacing: 0.5,
  },
  tagline: {
    ...typography.bodyMedium,
    color: darkPalette.subtle,
    textAlign: 'center',
  },
  actions: { gap: 14 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.xl,
    padding: 18,
    gap: 14,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.xl,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: darkPalette.border,
  },
  btnIcon: { flexShrink: 0 },
  btnTitle: {
    ...typography.labelLarge,
    color: darkPalette.text,
    marginBottom: 2,
  },
  btnSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.65)',
  },
  footer: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: darkPalette.subtle,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
