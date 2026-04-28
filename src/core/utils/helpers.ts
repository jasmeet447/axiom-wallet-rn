/**
 * Format a wallet address for display
 * Example: 0x1234...5678
 */
export const formatAddress = (
  address: string,
  startLength = 6,
  endLength = 4,
): string => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Format balance with decimals
 */
export const formatBalance = (
  balance: string | number,
  decimals = 18,
): string => {
  const value = typeof balance === 'string' ? parseFloat(balance) : balance;
  return (value / Math.pow(10, decimals)).toFixed(6);
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number | string,
  currency = 'USDT',
): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} ${currency}`;
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate amount
 */
export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

/**
 * Truncate text
 */
export const truncate = (text: string, maxLength = 50): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Wait for a specified time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  _wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), _wait);
  };
};
