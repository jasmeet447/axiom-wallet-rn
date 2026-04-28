import { api } from './apiClient';

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface WalletBalance {
  address: string;
  balance: string;
  network: string;
}

export const blockchainApi = {
  // Get wallet balance
  getBalance: async (address: string): Promise<WalletBalance> => {
    const response = await api.get(`/wallet/${address}/balance`);
    return response.data;
  },

  // Get transaction history
  getTransactions: async (
    address: string,
    page = 0,
    limit = 20,
  ): Promise<BlockchainTransaction[]> => {
    const response = await api.get(`/wallet/${address}/transactions`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get transaction details
  getTransaction: async (hash: string): Promise<BlockchainTransaction> => {
    const response = await api.get(`/transaction/${hash}`);
    return response.data;
  },

  // Send transaction
  sendTransaction: async (
    from: string,
    to: string,
    value: string,
    privateKey: string,
  ): Promise<{ hash: string }> => {
    const response = await api.post('/transaction/send', {
      from,
      to,
      value,
      privateKey,
    });
    return response.data;
  },

  // Estimate gas fee
  estimateGas: async (
    from: string,
    to: string,
    value: string,
  ): Promise<{ gasPrice: string; gasLimit: string }> => {
    const response = await api.post('/transaction/estimate-gas', {
      from,
      to,
      value,
    });
    return response.data;
  },
};
