/**
 * String constants for SendScreen.
 */
export const SendStrings = {
  // Step labels (used in progress indicator)
  stepLabels: ['Recipient', 'Amount', 'Confirm'],

  // Step: Address
  address: {
    title: 'Recipient',
    subtitle: 'Enter or scan the Ethereum address you want to send to.',
    fieldLabel: 'To address',
    placeholder: '0x4Ab3…',
    paste: 'Paste',
    scanQr: 'Scan QR',
    continueBtn: 'Continue',
  },

  // QR scanner
  scanner: {
    hint: 'Align the QR code within the frame',
    cameraPermissionTitle: 'Camera Permission Required',
    cameraPermissionMessage:
      'Enable camera access in Settings to scan QR codes.',
  },

  // Step: Amount
  amount: {
    title: 'Amount',
    subtitle: 'How much ETH would you like to send?',
    fieldLabel: 'Amount (ETH)',
    placeholder: '0.00',
    maxBtn: 'Max',
    continueBtn: 'Review',
  },

  // Step: Confirm
  confirm: {
    title: 'Review Transaction',
    subtitle: 'Please verify all details before sending.',
    rows: {
      to: 'To',
      amount: 'Amount',
      networkFee: 'Network Fee',
      total: 'Total',
    },
    sendBtn: 'Send',
    securityNote: 'This transaction cannot be reversed once confirmed.',
  },

  // Step: Success
  success: {
    title: 'Sent!',
    subtitle: 'Your transaction has been broadcast to the network.',
    txHashLabel: 'Transaction Hash',
    doneBtn: 'Done',
  },

  // Validation errors
  errors: {
    invalidAddress: 'Enter a valid Ethereum address starting with 0x.',
    ownAddress: "You can't send to your own wallet address.",
    invalidAmount: 'Enter a valid amount greater than 0.',
    insufficientBalance: 'Insufficient balance.',
    exceedsBalanceWithFee:
      'Amount + network fee exceeds your available balance.',
  },

  // Transaction failed alert
  txFailedTitle: 'Transaction Failed',
  txFailedMessage:
    'Could not broadcast the transaction. Check your connection and try again.',
} as const;
