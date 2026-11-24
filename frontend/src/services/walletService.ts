import { apiClient } from "../lib/apiClient";
import { extractBackendMessage } from "../utils/apiError";
import type { ChipTransaction, WalletSummary } from "../types/wallet";
import type { PageQueryParams, PageResponse } from "../types/page";

export const walletService = {
  async getWallet(): Promise<WalletSummary> {
    try {
      const { data } = await apiClient.get<WalletSummary>("/wallet");
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load chip wallet"));
    }
  },

  async getTransactions( params: PageQueryParams = {}): Promise<PageResponse<ChipTransaction>> {
    try {
      const { page = 0, limit = 10 } = params;
      const { data } = await apiClient.get<PageResponse<ChipTransaction>>("/wallet/transactions",
        { params: { page, limit }}
      );
      return data;
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load transaction history"));
    }
  },
};