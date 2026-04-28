/**
 * Shared strings used across multiple screens.
 */
export const CommonStrings = {
  // General actions
  actions: {
    tryAgain: 'Try Again',
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    continue: 'Continue',
    done: 'Done',
    paste: 'Paste',
    copy: 'Copy',
    share: 'Share',
    refresh: 'Refresh',
  },

  // Generic errors
  errors: {
    unknown: 'An unexpected error occurred.',
    networkError: 'Network error. Please check your connection.',
    somethingWentWrong: 'Something went wrong',
    noWalletActive: 'No wallet active',
  },

  // Accessibility / hints
  hints: {
    pullToRefresh: 'Pull to refresh',
  },
} as const;
