/**
 * UI formatting helpers used across multiple screens.
 *
 * Centralises logic that was previously duplicated in:
 *   WalletScreen · SendScreen · TransactionsScreen · core/utils/helpers (partially)
 */

// ─── Address ─────────────────────────────────────────────────────────────────

/**
 * Truncates an Ethereum address for display.
 * @example truncateAddress('0x1234567890abcdef1234567890abcdef12345678') → '0x1234…5678'
 */
export function truncateAddress(
  address: string,
  startLen = 6,
  endLen = 4,
): string {
  if (!address || address.length <= startLen + endLen + 3) {
    return address || '—';
  }
  return `${address.slice(0, startLen)}...${address.slice(-endLen)}`;
}

/** EVM address validation regex */
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/** Returns true if the string is a valid EVM (Ethereum) address. */
export function isValidEVMAddress(address: string): boolean {
  return EVM_ADDRESS_RE.test(address.trim());
}

// ─── Balance / amounts ───────────────────────────────────────────────────────

/**
 * Formats an ETH balance string for display (4 decimal places).
 * Returns '—' for null / NaN values.
 */
export function formatETHBalance(raw: string | null | undefined): string {
  if (raw === null || raw === undefined) return '—';
  const n = parseFloat(raw);
  if (isNaN(n)) return '—';
  return n.toFixed(4);
}

/**
 * Formats any numeric ETH value string for display (4 decimal places).
 * Returns the original string if it cannot be parsed.
 */
export function formatETHValue(value: string): string {
  const n = parseFloat(value);
  if (isNaN(n)) return value;
  return n.toFixed(4);
}

/**
 * Calculates the network fee in ETH from gas price (Gwei) and gas limit.
 * Falls back to 0.0001 ETH if inputs are invalid.
 */
export function calcFeeETH(gasPrice: string, gasLimit: string): number {
  const price = parseFloat(gasPrice);
  const limit = parseFloat(gasLimit);
  if (isNaN(price) || isNaN(limit)) return 0.0001;
  return (price * limit) / 1e9; // Gwei × units → ETH
}

// ─── Dates ───────────────────────────────────────────────────────────────────

/**
 * Formats a Unix-millisecond timestamp for the transactions list.
 * Shows time-only when the transaction is from today; otherwise short date.
 */
export function formatTxDate(timestampMs: number): string {
  const d = new Date(timestampMs);
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

// ─── Seed phrase ─────────────────────────────────────────────────────────────

/**
 * Normalises raw seed-phrase input into an array of lowercase words.
 * Accepts space- or comma-separated input.
 */
export function normaliseSeedPhrase(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
}
