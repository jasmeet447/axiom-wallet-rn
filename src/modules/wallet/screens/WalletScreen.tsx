import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWdkWallet } from '../hooks/useWdkWallet';

const DARK = {
  bg: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  subtle: '#8E8E93',
  primary: '#0A84FF',
  success: '#30D158',
  border: '#38383A',
};

function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address || '—';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const WalletScreen: React.FC = () => {
  const { wallets, activeWallet, activeWalletId, switchWallet } =
    useWdkWallet();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.heading}>My Wallets</Text>

        {/* Active wallet card */}
        {activeWallet ? (
          <View style={styles.activeCard}>
            <View style={styles.activeCardTop}>
              <Ionicons name="wallet" size={28} color={DARK.primary} />
              <View style={styles.activeCardInfo}>
                <Text style={styles.activeWalletName}>{activeWallet.name}</Text>
                <Text style={styles.activeWalletNetwork}>
                  {activeWallet.network}
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <Ionicons
                name="copy-outline"
                size={14}
                color={DARK.subtle}
                style={styles.copyIcon}
              />
              <Text style={styles.addressText}>
                {activeWallet.address
                  ? truncateAddress(activeWallet.address)
                  : 'Unlock to reveal address'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={40} color={DARK.subtle} />
            <Text style={styles.emptyText}>No wallet selected</Text>
          </View>
        )}

        {/* Wallet list — shown when multiple wallets exist */}
        {wallets.length > 1 && (
          <>
            <Text style={styles.sectionLabel}>All Wallets</Text>
            {wallets.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.walletRow,
                  w.id === activeWalletId && styles.walletRowActive,
                ]}
                onPress={() => switchWallet(w.id)}
                activeOpacity={0.75}
              >
                <View style={styles.walletRowIcon}>
                  <Ionicons
                    name={w.id === activeWalletId ? 'wallet' : 'wallet-outline'}
                    size={20}
                    color={w.id === activeWalletId ? DARK.primary : DARK.subtle}
                  />
                </View>
                <View style={styles.walletRowMeta}>
                  <Text style={styles.walletRowName}>{w.name}</Text>
                  <Text style={styles.walletRowAddr}>
                    {truncateAddress(w.address)}
                  </Text>
                </View>
                {w.id === activeWalletId && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={DARK.success}
                  />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK.bg },
  scroll: { padding: 20 },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: DARK.text,
    marginBottom: 20,
  },
  activeCard: {
    backgroundColor: DARK.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DARK.border,
    padding: 16,
    marginBottom: 24,
  },
  activeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeCardInfo: { flex: 1 },
  activeWalletName: {
    fontSize: 17,
    fontWeight: '600',
    color: DARK.text,
  },
  activeWalletNetwork: {
    fontSize: 13,
    color: DARK.subtle,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#0A84FF22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: DARK.primary,
  },
  activeBadgeText: { color: DARK.primary, fontSize: 12, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: DARK.border,
    marginVertical: 12,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  copyIcon: {},
  addressText: {
    fontSize: 14,
    color: DARK.subtle,
    fontFamily: 'monospace',
  },
  emptyCard: {
    backgroundColor: DARK.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DARK.border,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  emptyText: { color: DARK.subtle, fontSize: 15 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK.subtle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DARK.border,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  walletRowActive: { borderColor: DARK.primary },
  walletRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletRowMeta: { flex: 1 },
  walletRowName: { fontSize: 15, fontWeight: '600', color: DARK.text },
  walletRowAddr: {
    fontSize: 13,
    color: DARK.subtle,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
