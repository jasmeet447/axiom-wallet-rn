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
import type {
  Transaction,
  TxType,
} from '../../../store/slices/transactionsSlice';

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
function truncate(s: string, start = 8, end = 6): string {
  if (!s || s.length <= start + end + 3) {
    return s;
  }
  return `${s.slice(0, start)}...${s.slice(-end)}`;
}

function formatValue(value: string): string {
  const n = parseFloat(value);
  if (isNaN(n)) {
    return value;
  }
  // Values stored in ETH
  return n.toFixed(4);
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
type Filter = 'all' | TxType;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'send', label: 'Sent' },
  { key: 'receive', label: 'Received' },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  confirmed: { color: C.success, icon: 'checkmark-circle' },
  pending: { color: C.warning, icon: 'time' },
  failed: { color: C.error, icon: 'close-circle' },
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
  text: { fontSize: 10, fontWeight: '600', marginLeft: 3 },
});

// ─── TransactionRow ───────────────────────────────────────────────────────────
const TransactionRow: React.FC<{ tx: Transaction; myAddress: string }> = ({
  tx,
  myAddress,
}) => {
  const isSend = tx.type === 'send';
  const counterpart = isSend ? tx.to : tx.from;
  const iconColor = isSend ? C.error : C.success;
  const iconName = isSend ? 'arrow-up' : 'arrow-down';
  const amountColor = isSend ? C.text : C.success;
  const sign = isSend ? '−' : '+';

  return (
    <View style={r.row}>
      {/* Direction icon */}
      <View
        style={[
          r.iconCircle,
          { backgroundColor: iconColor + '18', borderColor: iconColor + '40' },
        ]}
      >
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      {/* Middle: label + address */}
      <View style={r.mid}>
        <Text style={r.label}>{isSend ? 'Sent' : 'Received'}</Text>
        <Text style={r.addr}>
          {isSend ? 'To ' : 'From '}
          {truncate(counterpart)}
        </Text>
        <StatusBadge status={tx.status} />
      </View>

      {/* Right: amount + date */}
      <View style={r.right}>
        <Text style={[r.amount, { color: amountColor }]}>
          {sign}
          {formatValue(tx.value)} ETH
        </Text>
        <Text style={r.date}>{formatDate(tx.timestamp)}</Text>
      </View>
    </View>
  );
};
const r = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
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
  label: { fontSize: 14, fontWeight: '600', color: C.text },
  addr: { fontSize: 12, color: C.subtle, fontFamily: 'monospace' },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700' },
  date: { fontSize: 11, color: C.subtle },
});

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ filter: Filter }> = ({ filter }) => (
  <View style={e.wrap}>
    <View style={e.iconCircle}>
      <Ionicons name="receipt-outline" size={44} color={C.subtle} />
    </View>
    <Text style={e.title}>No transactions</Text>
    <Text style={e.sub}>
      {filter === 'all'
        ? 'Your transaction history will appear here once you send or receive ETH.'
        : `No ${filter === 'send' ? 'outgoing' : 'incoming'} transactions yet.`}
    </Text>
  </View>
);
const e = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 8 },
  sub: { fontSize: 14, color: C.subtle, textAlign: 'center', lineHeight: 21 },
});

// ─── ErrorState ───────────────────────────────────────────────────────────────
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <View style={er.wrap}>
    <Ionicons name="cloud-offline-outline" size={48} color={C.error} />
    <Text style={er.title}>Something went wrong</Text>
    <Text style={er.msg}>{message}</Text>
    <TouchableOpacity style={er.btn} onPress={onRetry} activeOpacity={0.8}>
      <Ionicons name="refresh" size={16} color="#fff" />
      <Text style={er.btnText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);
const er = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginTop: 16,
    marginBottom: 8,
  },
  msg: {
    fontSize: 13,
    color: C.subtle,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 28,
    gap: 8,
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

// ─── LoadingFooter ────────────────────────────────────────────────────────────
const LoadingFooter: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
      <ActivityIndicator color={C.primary} size="small" />
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

  // Initial load
  useEffect(() => {
    if (address) {
      fetchTransactions(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const onRefresh = useCallback(async () => {
    if (!address) {
      return;
    }
    setRefreshing(true);
    await fetchTransactions(address);
    setRefreshing(false);
  }, [address, fetchTransactions]);

  const onEndReached = useCallback(() => {
    if (address) {
      fetchMoreTransactions(address);
    }
  }, [address, fetchMoreTransactions]);

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return transactions;
    }
    return transactions.filter(tx => tx.type === filter);
  }, [transactions, filter]);

  // Show full-screen spinner only on the very first load
  const initialLoading = isLoading && transactions.length === 0 && !error;

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Filter tabs ───────────────────────────────────────────── */}
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
            {/* Unread count badge */}
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

      {/* ── Body ──────────────────────────────────────────────────── */}
      {initialLoading ? (
        <View style={s.centerWrap}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={s.loadingText}>Loading transactions…</Text>
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
              tintColor={C.primary}
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
  safe: { flex: 1, backgroundColor: C.bg },

  // Filter tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  tabActive: { backgroundColor: '#0A84FF18', borderColor: '#0A84FF60' },
  tabText: { fontSize: 14, fontWeight: '500', color: C.subtle },
  tabTextActive: { color: C.primary, fontWeight: '600' },
  badge: {
    backgroundColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeActive: { backgroundColor: C.primary },
  badgeText: { fontSize: 10, fontWeight: '700', color: C.subtle },
  badgeTextActive: { color: '#fff' },

  // States
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.subtle, marginTop: 12, fontSize: 14 },

  // List
  list: { padding: 16, paddingBottom: 40 },
  listEmpty: { flex: 1 },
});
