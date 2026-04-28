/**
 * String constants for the auth flow:
 *   SetupScreen · CreateWalletScreen · ImportWalletScreen · UnlockScreen
 */
export const AuthStrings = {
  // ─── SetupScreen ────────────────────────────────────────────────────────────
  setup: {
    appName: 'Axiom Wallet',
    tagline: 'A secure, self-custodial crypto wallet.\nYou own your keys.',
    createWallet: 'Create New Wallet',
    createWalletSubtitle: 'Generate a fresh wallet',
    importWallet: 'Import Existing Wallet',
    importWalletSubtitle: 'Restore from seed phrase',
    footer: 'Your keys are stored securely on this device and never leave it.',
  },

  // ─── CreateWalletScreen ─────────────────────────────────────────────────────
  createWallet: {
    title: 'Create New Wallet',
    subtitle:
      'A unique wallet will be generated for you. You will need to save your secret recovery phrase to restore access if you change devices.',
    warningMessage:
      'Never share your seed phrase. Anyone with it has full access to your wallet.',
    viewSeedPhrase: 'View Seed Phrase',

    backupTitle: 'Save Your Seed Phrase',
    backupSubtitle:
      'Write these words down in order and store them somewhere safe.',
    tapToReveal: 'Tap to reveal',
    iSavedIt: "I've Saved It",

    confirmTitle: 'Ready to Go',
    confirmSubtitle:
      'Your wallet is ready. Biometric authentication will be used to unlock it on future launches.',
    confirmCheckboxLabel: 'I confirm I have securely saved my seed phrase.',
    createWalletBtn: 'Create Wallet',

    defaultWalletName: 'Main Wallet',
  },

  // ─── ImportWalletScreen ─────────────────────────────────────────────────────
  importWallet: {
    title: 'Import Wallet',
    subtitle:
      'Enter your 12 or 24-word secret recovery phrase. Words can be separated by spaces or commas.',
    seedPhraseLabel: 'Seed Phrase',
    seedPhrasePlaceholder: 'Enter your seed phrase…',
    wordCountSingular: 'word',
    wordCountPlural: 'words',
    invalidWordCount: 'A seed phrase must be exactly 12 or 24 words.',
    importBtn: 'Import Wallet',
    securityNote: 'Your phrase is encrypted locally and never transmitted.',
    defaultWalletName: 'Imported Wallet',
  },

  // ─── UnlockScreen ───────────────────────────────────────────────────────────
  unlock: {
    title: 'Welcome Back',
    subtitle: 'Verify your identity to access your wallet',
    biometricIos: 'Face ID / Touch ID',
    biometricAndroid: 'Biometrics',
    unlockBtnPrefix: 'Unlock with ',
    enrollHint: 'Make sure your device biometrics are enrolled.',
    noWalletError: 'No wallet found. Please create a wallet first.',
  },
} as const;
