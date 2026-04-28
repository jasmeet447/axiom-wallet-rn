export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_ADDRESS: 'Invalid wallet address.',
  INVALID_AMOUNT: 'Invalid amount.',
  INSUFFICIENT_BALANCE: 'Insufficient balance.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  BIOMETRIC_NOT_AVAILABLE:
    'Biometric authentication is not available on this device.',
  BIOMETRIC_FAILED: 'Biometric authentication failed.',
  PIN_INCORRECT: 'Incorrect PIN code.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
} as const;

export class AppError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

export const handleError = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.response) {
    // API error response
    return error.response.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  if (error.message) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};
