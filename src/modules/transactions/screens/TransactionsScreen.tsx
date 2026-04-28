import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTransactions } from '../hooks/useTransactions';
import { useWdkWallet } from '../../wallet/hooks/useWdkWallet';
import { darkPalette, spacing, borderRadius, typography } from '../../../theme';
import { TransactionStrings } from '../../../constants/strings';
import {
  truncateAddress,
  formatETHValue,
  formatTxDate,
} from '../../../core/utils/formatters';
import { TransactionListSkeleton } from '../../../shared/components';
import type {
  Transaction,
  TxType,
} from '../../../store/slices/transactionsSlice';

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type Filter = 'all' | TxType;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: TransactionStrings.filters.all },
  { key: 'send', label: TransactionStrings.filters.sent },
  { key: 'receive', label: TransactionStrings.filters.received },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  confirmed: { color: darkPalette.success, icon: 'checkmark-circle' },
  pending: { color: darkPalette.warning, icon: 'time' },
  failed: { color: darkPalette.error, icon: 'close-circle' },
} as const;

const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({
  status,
}) => {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <View
      style={[
        sb.wrap,
        { borderColor: cfg.color + '50', backgroundColor: cfg.color + '14' },
      ]}
    >
      <Ionicons name={cfg.icon} size={11} color={cfg.color} />
      <Text style={[sb.text, { color: cfg.color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};
const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
  },
  text: { ...typography.caption, fontWeight: '600', marginLeft: 3 },
});

// ─── TransactionRow ───────────────────────────────────────────────────────────
const TransactionRow: React.FC<{ tx: Transaction; myAddress: string }> = ({
  tx,
}) => {
  const isSend = tx.type === 'send';
  const counterpart = isSend ? tx.to : tx.from;
  const iconColor = isSend ? darkPalette.error : darkPalette.success;
  const iconName = isSend ? 'arrow-up' : 'arrow-down';
  const amountColor = isSend ? darkPalette.text : darkPalette.success;
  const sign = isSend ? '−' : '+';

  return (
    <View style={r.row}>
      <View
        style={[
          r.iconCircle,
          { backgroundColor: iconColor + '18', borderColor: iconColor + '40' },
        ]}
      >
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <View style={r.mid}>
        <Text style={r.label}>
          {isSend
            ? TransactionStrings.row.sent
            : TransactionStrings.row.received}
        </Text>
        <Text style={r.addr}>
          {isSend ? TransactionStrings.row.to : TransactionStrings.row.from}
          {truncateAddress(counterpart, 8, 6)}
        </Text>
        <StatusBadge status={tx.status} />
      </View>

      <View style={r.right}>
        <Text style={[r.amount, { color: amountColor }]}>
          {sign}
          {formatETHValue(tx.value)} {TransactionStrings.row.currency}
        </Text>
        <Text style={r.date}>{formatTxDate(tx.timestamp)}</Text>
      </View>
    </View>
  );
};
const r = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 14,
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  mid: { flex: 1, gap: 3 },
  label: { ...typography.labelMedium, color: darkPalette.text },
  addr: { ...typography.mono, color: darkPalette.subtle },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { ...typography.labelMedium },
  date: { ...typography.caption, color: darkPalette.subtle },
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ filter: Filter }> = ({ filter }) => (
  <View style={em.wrap}>
    <View style={em.iconCircle}>
      <Ionicons name="receipt-outline" size={44} color={darkPalette.subtle} />
    </View>
    <Text style={em.title}>{TransactionStrings.empty.title}</Text>
    <Text style={em.sub}>
      {filter === 'all'
        ? TransactionStrings.empty.allSubtitle
        : filter === 'send'
        ? TransactionStrings.empty.sentSubtitle
        : TransactionStrings.empty.receivedSubtitle}
    </Text>
  </View>
);
const em = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: darkPalette.card,
    borderWidth: 1,
    borderColor: darkPalette.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: darkPalette.text,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    textAlign: 'center',
    lineHeight: 21,
  },
});

// ─── ErrorState ───────────────────────────────────────────────────────────────
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <View style={er.wrap}>
    <Ionicons
      name="cloud-offline-outline"
      size={48}
      color={darkPalette.error}
    />
    <Text style={er.title}>{TransactionStrings.error.title}</Text>
    <Text style={er.msg}>{message}</Text>
    <TouchableOpacity style={er.btn} onPress={onRetry} activeOpacity={0.8}>
      <Ionicons name="refresh" size={16} color={darkPalette.text} />
      <Text style={er.btnText}>{TransactionStrings.error.retryBtn}</Text>
    </TouchableOpacity>
  </View>
);
const er = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: darkPalette.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  msg: {
    ...typography.bodySmall,
    color: darkPalette.subtle,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 13,
    paddingHorizontal: 28,
    gap: spacing.sm,
  },
  btnText: { ...typography.labelMedium, color: darkPalette.text },
});

// ─── LoadingFooter ────────────────────────────────────────────────────────────
const LoadingFooter: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <View style={{ paddingVertical: spacing.lg, alignItems: 'center' }}>
      <ActivityIndicator color={darkPalette.primary} size="small" />
    </View>
  ) : null;

// ─── TransactionsScreen ───────────────────────────────────────────────────────
export const TransactionsScreen: React.FC = () => {
  const { activeWallet } = useWdkWallet();
  const address = activeWallet?.address ?? '';

  const {
    transactions,
    isLoading,
    error,
    hasMore,
    fetchTransactions,
    fetchMoreTransactions,
  } = useTransactions();

  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (address) {
      fetchTransactions(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const onRefresh = useCallback(async () => {
    if (!address) return;
    setRefreshing(true);
    await fetchTransactions(address);
    setRefreshing(false);
  }, [address, fetchTransactions]);

  const onEndReached = useCallback(() => {
    if (address) fetchMoreTransactions(address);
  }, [address, fetchMoreTransactions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(tx => tx.type === filter);
  }, [transactions, filter]);

  const initialLoading = isLoading && transactions.length === 0 && !error;

  return (
    <SafeAreaView style={s.safe}>
      {/* Filter tabs */}
      <View style={s.tabs}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.tab, filter === f.key && s.tabActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.tabText, filter === f.key && s.tabTextActive]}>
              {f.label}
            </Text>
            {f.key !== 'all' &&
              (() => {
                const count = transactions.filter(
                  tx => tx.type === f.key,
                ).length;
                return count > 0 ? (
                  <View style={[s.badge, filter === f.key && s.badgeActive]}>
                    <Text
                      style={[
                        s.badgeText,
                        filter === f.key && s.badgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                ) : null;
              })()}
          </TouchableOpacity>
        ))}
      </View>

      {initialLoading ? (
        <View style={s.skeletonWrap}>
          <TransactionListSkeleton rows={7} />
        </View>
      ) : error ? (
        <View style={s.centerWrap}>
          <ErrorState
            message={error}
            onRetry={() => address && fetchTransactions(address)}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TransactionRow tx={item} myAddress={address} />
          )}
          contentContainerStyle={[s.list, filtered.length === 0 && s.listEmpty]}
          ListEmptyComponent={<EmptyState filter={filter} />}
          ListFooterComponent={
            <LoadingFooter visible={isLoading && transactions.length > 0} />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={darkPalette.primary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Screen styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: darkPalette.bg },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: darkPalette.border,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: darkPalette.card,
    borderWidth: 1,
    borderColor: darkPalette.border,
    gap: 6,
  },
  tabActive: {
    backgroundColor: darkPalette.primaryFaint,
    borderColor: darkPalette.primaryBorder,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: darkPalette.subtle,
  },
  tabTextActive: { color: darkPalette.primary, fontWeight: '600' },
  badge: {
    backgroundColor: darkPalette.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeActive: { backgroundColor: darkPalette.primary },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: darkPalette.subtle,
  },
  badgeTextActive: { color: darkPalette.text },

  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  skeletonWrap: { padding: spacing.md },
  loadingText: {
    color: darkPalette.subtle,
    marginTop: 12,
    ...typography.bodySmall,
  },

  list: { padding: spacing.md, paddingBottom: 40 },
  listEmpty: { flex: 1 },
});

