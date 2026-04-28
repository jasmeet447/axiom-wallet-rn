/**
 * String constants for TransactionsScreen.
 */
export const TransactionStrings = {
  // Filter tabs
  filters: {
    all: 'All',
    sent: 'Sent',
    received: 'Received',
  },

  // Transaction row
  row: {
    sent: 'Sent',
    received: 'Received',
    to: 'To ',
    from: 'From ',
    currency: 'ETH',
  },

  // Status badge labels
  status: {
    confirmed: 'Confirmed',
    pending: 'Pending',
    failed: 'Failed',
  },

  // Empty state
  empty: {
    title: 'No transactions',
    allSubtitle:
      'Your transaction history will appear here once you send or receive ETH.',
    sentSubtitle: 'No outgoing transactions yet.',
    receivedSubtitle: 'No incoming transactions yet.',
  },

  // Error state
  error: {
    title: 'Something went wrong',
    retryBtn: 'Try Again',
  },
} as const;
