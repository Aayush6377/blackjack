import { apiClient } from "../lib/apiClient";
import { extractBackendMessage } from "../utils/apiError";
import type { ChipTransaction, WalletSummary } from "../types/wallet";

export const walletService = {
  async getWallet(): Promise<WalletSummary> {
    try {
      const { data } = await apiClient.get<WalletSummary>("/wallet");
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load chip wallet"));
    }
  },

  async getTransactions(): Promise<ChipTransaction[]> {
    try {
      const { data } = await apiClient.get<ChipTransaction[]>("/wallet/transactions");
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load transaction history"));
    }
  },
};