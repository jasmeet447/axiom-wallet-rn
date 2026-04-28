/**
 * String constants for WalletScreen (Dashboard / Home tab).
 */
export const WalletStrings = {
  heading: 'Dashboard',

  // Balance card
  balance: {
    label: 'Balance',
    currency: 'ETH',
    fetching: 'Fetching…',
    noAddress: 'No address',
    noWalletSelected: 'No wallet selected',
    fetchError: 'Failed to load balance. Tap to retry.',
  },

  // Active pill
  activePill: 'Active',

  // Actions row
  actions: {
    send: 'Send',
    receive: 'Receive',
    history: 'History',
  },

  // Wallet switcher
  myWallets: 'My Wallets',

  // Network names
  network: {
    mainnet: 'mainnet',
    goerli: 'goerli',
    sepolia: 'sepolia',
  },
} as const;
