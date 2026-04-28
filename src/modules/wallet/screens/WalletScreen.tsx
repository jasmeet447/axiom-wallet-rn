import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useWdkWallet } from '../hooks/useWdkWallet';
import { blockchainApi } from '../../../core/api/blockchainApi';
import type { MainStackParamList } from '../../../app/navigation/MainNavigator';

// ─── Design tokens ────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(address: string): string {
  if (!address || address.length < 10) return address || '—';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(raw: string | null): string {
  if (raw === null) return '—';
  const n = parseFloat(raw);
  if (isNaN(n)) return '—';
  return n.toFixed(4);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<MainStackParamList, 'Wallet'>;

// ─── ActionButton ─────────────────────────────────────────────────────────────
interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
}) => (
  <TouchableOpacity style={s.actionBtn} onPress={onPress} activeOpacity={0.75}>
    <View style={s.actionIconWrap}>
      <Ionicons name={icon} size={24} color={C.primary} />
    </View>
    <Text style={s.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// ─── WalletScreen (Dashboard) ─────────────────────────────────────────────────
export const WalletScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { wallets, activeWallet, activeWalletId, switchWallet } =
    useWdkWallet();

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = useCallback(async (address: string) => {
    if (!address) {
      return;
    }
    try {
      setBalanceLoading(true);
      const data = await blockchainApi.getBalance(address);
      setBalance(data.balance);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    setBalance(null);
    if (activeWallet?.address) {
      fetchBalance(activeWallet.address);
    }
  }, [activeWallet?.address, fetchBalance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeWallet?.address) {
      await fetchBalance(activeWallet.address);
    }
    setRefreshing(false);
  }, [activeWallet?.address, fetchBalance]);

  const shareAddress = useCallback(() => {
    if (!activeWallet?.address) {
      return;
    }
    Share.share({ message: activeWallet.address }).catch(() => {
      Alert.alert('Address', activeWallet.address);
    });
  }, [activeWallet?.address]);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      >
        {/* ── Header ─────────────────────────────────── */}
        <Text style={s.heading}>Dashboard</Text>

        {/* ── Balance hero card ──────────────────────── */}
        {activeWallet ? (
          <View style={s.heroCard}>
            {/* Name + active pill */}
            <View style={s.heroTop}>
              <View style={s.heroLeft}>
                <View style={s.walletIconCircle}>
                  <Ionicons name="wallet" size={20} color={C.primary} />
                </View>
                <View style={s.heroNameBlock}>
                  <Text style={s.heroName}>{activeWallet.name}</Text>
                  <Text style={s.heroNetwork}>{activeWallet.network}</Text>
                </View>
              </View>
              <View style={s.activePill}>
                <View style={s.activeDot} />
                <Text style={s.activePillText}>Active</Text>
              </View>
            </View>

            {/* Address */}
            <TouchableOpacity
              style={s.addressRow}
              onPress={shareAddress}
              activeOpacity={0.7}
            >
              <Text style={s.addressText}>
                {activeWallet.address
                  ? truncate(activeWallet.address)
                  : 'No address'}
              </Text>
              <Ionicons
                name="share-outline"
                size={13}
                color={C.subtle}
                style={s.shareIcon}
              />
            </TouchableOpacity>

            <View style={s.divider} />

            {/* Balance */}
            <View style={s.balanceBlock}>
              <Text style={s.balanceLabel}>Balance</Text>
              {balanceLoading ? (
                <View style={s.balanceLoadingRow}>
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text style={s.balanceLoadingText}>Fetching…</Text>
                </View>
              ) : (
                <Text style={s.balanceValue}>
                  {formatBalance(balance)}
                  <Text style={s.balanceCurrency}> ETH</Text>
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Ionicons name="wallet-outline" size={44} color={C.subtle} />
            <Text style={s.emptyText}>No wallet selected</Text>
          </View>
        )}

        {/* ── Quick actions ─────────────────────────── */}
        {activeWallet && (
          <View style={s.actionsCard}>
            <ActionButton
              icon="arrow-up-circle-outline"
              label="Send"
              onPress={() => navigation.navigate('Send')}
            />
            <View style={s.actionDivider} />
            <ActionButton
              icon="arrow-down-circle-outline"
              label="Receive"
              onPress={() => navigation.navigate('Receive')}
            />
            <View style={s.actionDivider} />
            <ActionButton
              icon="time-outline"
              label="History"
              onPress={() => navigation.navigate('Transactions')}
            />
          </View>
        )}

        {/* ── Wallet switcher ──────────────────────── */}
        {wallets.length > 1 && (
          <>
            <Text style={s.sectionLabel}>My Wallets</Text>
            {wallets.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[
                  s.walletRow,
                  w.id === activeWalletId && s.walletRowActive,
                ]}
                onPress={() => switchWallet(w.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    s.walletRowIcon,
                    w.id === activeWalletId && s.walletRowIconActive,
                  ]}
                >
                  <Ionicons
                    name={w.id === activeWalletId ? 'wallet' : 'wallet-outline'}
                    size={18}
                    color={w.id === activeWalletId ? C.primary : C.subtle}
                  />
                </View>
                <View style={s.walletRowMeta}>
                  <Text style={s.walletRowName}>{w.name}</Text>
                  <Text style={s.walletRowAddr}>{truncate(w.address)}</Text>
                </View>
                {w.id === activeWalletId ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={C.success}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={C.subtle} />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  // Header
  heading: { fontSize: 28, fontWeight: '700', color: C.text, marginBottom: 20 },

  // Hero card
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center' },
  walletIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0A84FF18',
    borderWidth: 1,
    borderColor: '#0A84FF44',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroNameBlock: {},
  heroName: { fontSize: 16, fontWeight: '600', color: C.text },
  heroNetwork: {
    fontSize: 12,
    color: C.subtle,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2B0D',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.success,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.success,
    marginRight: 5,
  },
  activePillText: { color: C.success, fontSize: 11, fontWeight: '600' },

  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  addressText: { fontSize: 13, color: C.subtle, fontFamily: 'monospace' },
  shareIcon: { marginLeft: 6 },

  divider: { height: 1, backgroundColor: C.border, marginBottom: 16 },

  balanceBlock: {},
  balanceLabel: {
    fontSize: 11,
    color: C.subtle,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 38,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.5,
  },
  balanceCurrency: { fontSize: 20, fontWeight: '500', color: C.subtle },
  balanceLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  balanceLoadingText: { fontSize: 16, color: C.subtle },

  // Empty state
  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 48,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emptyText: { color: C.subtle, fontSize: 15 },

  // Actions
  actionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 28,
  },
  actionBtn: { alignItems: 'center', gap: 8, flex: 1 },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0A84FF14',
    borderWidth: 1,
    borderColor: '#0A84FF40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, color: C.subtle, fontWeight: '500' },
  actionDivider: { width: 1, height: 40, backgroundColor: C.border },

  // Wallet list
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.subtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
  },
  walletRowActive: { borderColor: C.primary + '80' },
  walletRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletRowIconActive: { backgroundColor: '#0A84FF14' },
  walletRowMeta: { flex: 1 },
  walletRowName: { fontSize: 15, fontWeight: '600', color: C.text },
  walletRowAddr: {
    fontSize: 12,
    color: C.subtle,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
