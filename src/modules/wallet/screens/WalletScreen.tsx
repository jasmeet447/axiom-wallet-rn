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
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useWdkWallet } from '../hooks/useWdkWallet';
import { blockchainApi } from '../../../core/api/blockchainApi';
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { WalletStrings } from '../../../constants/strings';
import {
  truncateAddress,
  formatETHBalance,
} from '../../../core/utils/formatters';
import { WalletCardSkeleton } from '../../../shared/components';
import type { MainTabParamList } from '../../../app/navigation/MainNavigator';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Home'>;

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
      <Ionicons name={icon} size={24} color={darkPalette.primary} />
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
  const [balanceError, setBalanceError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = useCallback(async (address: string) => {
    if (!address) return;
    try {
      setBalanceLoading(true);
      setBalanceError(false);
      const data = await blockchainApi.getBalance(address);
      setBalance(data.balance);
    } catch {
      setBalance(null);
      setBalanceError(true);
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
    if (!activeWallet?.address) return;
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
            tintColor={darkPalette.primary}
          />
        }
      >
        <Text style={s.heading}>{WalletStrings.heading}</Text>

        {/* ── Balance hero card ──────────────────────── */}
        {balanceLoading && !activeWallet ? (
          <WalletCardSkeleton />
        ) : activeWallet ? (
          <View style={s.heroCard}>
            <View style={s.heroTop}>
              <View style={s.heroLeft}>
                <View style={s.walletIconCircle}>
                  <Ionicons
                    name="wallet"
                    size={20}
                    color={darkPalette.primary}
                  />
                </View>
                <View>
                  <Text style={s.heroName}>{activeWallet.name}</Text>
                  <Text style={s.heroNetwork}>{activeWallet.network}</Text>
                </View>
              </View>
              <View style={s.activePill}>
                <View style={s.activeDot} />
                <Text style={s.activePillText}>{WalletStrings.activePill}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={s.addressRow}
              onPress={shareAddress}
              activeOpacity={0.7}
            >
              <Text style={s.addressText}>
                {activeWallet.address
                  ? truncateAddress(activeWallet.address)
                  : WalletStrings.balance.noAddress}
              </Text>
              <Ionicons
                name="share-outline"
                size={13}
                color={darkPalette.subtle}
                style={s.shareIcon}
              />
            </TouchableOpacity>

            <View style={s.divider} />

            <View style={s.balanceBlock}>
              <Text style={s.balanceLabel}>{WalletStrings.balance.label}</Text>
              {balanceLoading ? (
                <View style={s.balanceLoadingRow}>
                  <ActivityIndicator size="small" color={darkPalette.primary} />
                  <Text style={s.balanceLoadingText}>
                    {WalletStrings.balance.fetching}
                  </Text>
                </View>
              ) : balanceError ? (
                <TouchableOpacity
                  style={s.balanceErrorRow}
                  onPress={() =>
                    activeWallet?.address && fetchBalance(activeWallet.address)
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={14}
                    color={darkPalette.error}
                    style={s.balanceErrorIcon}
                  />
                  <Text style={s.balanceErrorText}>
                    {WalletStrings.balance.fetchError}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={s.balanceValue}>
                  {formatETHBalance(balance)}
                  <Text style={s.balanceCurrency}>
                    {' '}
                    {WalletStrings.balance.currency}
                  </Text>
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={s.emptyCard}>
            <Ionicons
              name="wallet-outline"
              size={44}
              color={darkPalette.subtle}
            />
            <Text style={s.emptyText}>
              {WalletStrings.balance.noWalletSelected}
            </Text>
          </View>
        )}

        {/* ── Quick actions ─────────────────────────── */}
        {activeWallet && (
          <View style={s.actionsCard}>
            <ActionButton
              icon="arrow-up-circle-outline"
              label={WalletStrings.actions.send}
              onPress={() => navigation.navigate('Send')}
            />
            <View style={s.actionDivider} />
            <ActionButton
              icon="arrow-down-circle-outline"
              label={WalletStrings.actions.receive}
              onPress={() => navigation.navigate('Receive')}
            />
            <View style={s.actionDivider} />
            <ActionButton
              icon="time-outline"
              label={WalletStrings.actions.history}
              onPress={() => navigation.navigate('Transactions')}
            />
          </View>
        )}

        {/* ── Wallet switcher ──────────────────────── */}
        {wallets.length > 1 && (
          <>
            <Text style={s.sectionLabel}>{WalletStrings.myWallets}</Text>
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
                    color={
                      w.id === activeWalletId
                        ? darkPalette.primary
                        : darkPalette.subtle
                    }
                  />
                </View>
                <View style={s.walletRowMeta}>
                  <Text style={s.walletRowName}>{w.name}</Text>
                  <Text style={s.walletRowAddr}>
                    {truncateAddress(w.address)}
                  </Text>
                </View>
                {w.id === activeWalletId ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={darkPalette.success}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={darkPalette.subtle}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkPalette.bg },
  scroll: { padding: spacing.md + 4, paddingBottom: 40 },

  heading: {
    ...typography.h1,
    color: darkPalette.text,
    marginBottom: spacing.lg,
  },

  heroCard: {
    backgroundColor: darkPalette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: spacing.md + 4,
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
    backgroundColor: darkPalette.primaryFaint,
    borderWidth: 1,
    borderColor: darkPalette.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroName: { ...typography.labelLarge, color: darkPalette.text },
  heroNetwork: {
    ...typography.caption,
    color: darkPalette.subtle,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.successBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: darkPalette.success,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: darkPalette.success,
    marginRight: 5,
  },
  activePillText: {
    ...typography.caption,
    color: darkPalette.success,
    fontWeight: '600',
  },

  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  addressText: { ...typography.mono, color: darkPalette.subtle },
  shareIcon: { marginLeft: 6 },

  divider: {
    height: 1,
    backgroundColor: darkPalette.border,
    marginBottom: 16,
  },

  balanceBlock: {},
  balanceLabel: {
    ...typography.overline,
    color: darkPalette.subtle,
    marginBottom: 6,
  },
  balanceValue: {
    ...typography.numericXL,
    color: darkPalette.text,
  },
  balanceCurrency: { ...typography.numericLG, color: darkPalette.subtle },
  balanceLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  balanceLoadingText: { ...typography.bodyLarge, color: darkPalette.subtle },
  balanceErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  balanceErrorIcon: { marginRight: 5 },
  balanceErrorText: {
    ...typography.bodySmall,
    color: darkPalette.error,
  },

  emptyCard: {
    backgroundColor: darkPalette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 48,
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emptyText: { ...typography.bodyMedium, color: darkPalette.subtle },

  actionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 18,
    marginBottom: 28,
  },
  actionBtn: { alignItems: 'center', gap: spacing.sm, flex: 1 },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: darkPalette.primaryFaint,
    borderWidth: 1,
    borderColor: darkPalette.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...typography.caption,
    color: darkPalette.subtle,
    fontWeight: '500',
  },
  actionDivider: { width: 1, height: 40, backgroundColor: darkPalette.border },

  sectionLabel: {
    ...typography.overline,
    color: darkPalette.subtle,
    marginBottom: 10,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 14,
    marginBottom: spacing.sm,
  },
  walletRowActive: { borderColor: darkPalette.primary + '80' },
  walletRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: darkPalette.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletRowIconActive: { backgroundColor: darkPalette.primaryFaint },
  walletRowMeta: { flex: 1 },
  walletRowName: { ...typography.labelMedium, color: darkPalette.text },
  walletRowAddr: {
    ...typography.mono,
    color: darkPalette.subtle,
    marginTop: 2,
  },
});
