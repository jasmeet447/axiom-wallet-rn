import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { darkPalette } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Single shimmer skeleton block.  Animates opacity to indicate loading.
 */
export const SkeletonBlock: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, opacity }, sk.base, style]}
    />
  );
};

const sk = StyleSheet.create({
  base: {
    backgroundColor: darkPalette.cardAlt,
  },
});

// ─── Wallet-card skeleton ─────────────────────────────────────────────────────

/** Mimics the balance hero-card while it's loading. */
export const WalletCardSkeleton: React.FC = () => (
  <View style={wcs.card}>
    <View style={wcs.topRow}>
      <SkeletonBlock width={42} height={42} borderRadius={21} />
      <View style={wcs.nameBlock}>
        <SkeletonBlock width={120} height={14} borderRadius={6} />
        <SkeletonBlock
          width={80}
          height={11}
          borderRadius={5}
          style={wcs.mt4}
        />
      </View>
    </View>
    <SkeletonBlock width={160} height={11} borderRadius={5} style={wcs.mt12} />
    <View style={wcs.divider} />
    <SkeletonBlock width={80} height={11} borderRadius={5} />
    <SkeletonBlock width={200} height={44} borderRadius={8} style={wcs.mt8} />
  </View>
);

const wcs = StyleSheet.create({
  card: {
    backgroundColor: darkPalette.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 20,
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  nameBlock: { marginLeft: 12, gap: 6 },
  divider: {
    height: 1,
    backgroundColor: darkPalette.border,
    marginVertical: 16,
  },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
});

// ─── Transaction-row skeleton ─────────────────────────────────────────────────

/** Renders n skeleton rows to fill the list while transactions are loading. */
export const TransactionListSkeleton: React.FC<{ rows?: number }> = ({
  rows = 6,
}) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <View key={i} style={tls.row}>
        <SkeletonBlock width={44} height={44} borderRadius={22} />
        <View style={tls.mid}>
          <SkeletonBlock width={80} height={13} borderRadius={6} />
          <SkeletonBlock
            width={120}
            height={11}
            borderRadius={5}
            style={tls.mt4}
          />
        </View>
        <View style={tls.right}>
          <SkeletonBlock width={70} height={13} borderRadius={6} />
          <SkeletonBlock
            width={50}
            height={10}
            borderRadius={5}
            style={tls.mt4}
          />
        </View>
      </View>
    ))}
  </>
);

const tls = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkPalette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: darkPalette.border,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  mid: { flex: 1, gap: 4 },
  right: { alignItems: 'flex-end', gap: 4 },
  mt4: { marginTop: 4 },
});
