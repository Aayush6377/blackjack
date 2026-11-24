import { useQuery } from "@tanstack/react-query";
import { walletService } from "../services/walletService";
import type { PageQueryParams } from "../types/page";

export const walletKeys = {
  all: ["wallet"] as const,
  summary: () => [...walletKeys.all, "summary"] as const,
  transactions: (params: PageQueryParams) => [ ...walletKeys.all, "transactions", {
        page: params.page ?? 0, limit: params.limit ?? 10 } ] as const,
};

export function useWalletSummary() {
  return useQuery({
    queryKey: walletKeys.summary(),
    queryFn: () => walletService.getWallet(),
  });
}

export function useWalletTransactions(params: PageQueryParams = {}) {
  const normalizedParams: PageQueryParams = {
    page: params.page ?? 0,
    limit: params.limit ?? 10,
  };

  return useQuery({
    queryKey: walletKeys.transactions(normalizedParams),
    queryFn: () => walletService.getTransactions(normalizedParams),
    placeholderData: (previousData) => previousData,
  });
}