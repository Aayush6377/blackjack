import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { paymentService } from "../services/paymentService";
import type { CreatePaymentOrderRequest, PaymentVerificationResponse, VerifyPaymentRequest } from "../types/payment";
import { planKeys } from "./usePlans";
import type { PageQueryParams } from "../types/page";
import { walletKeys } from "./useWallet";

export const paymentKeys = {
  all: ["payments"] as const,
  orders: () => [...paymentKeys.all, "orders"] as const,
  verify: () => [...paymentKeys.all, "verify"] as const,
  purchases: (params: PageQueryParams) => [ ...paymentKeys.all, "purchases", 
    { page: params.page ?? 0, limit: params.limit ?? 10 } ] as const,
};

export function useCreatePaymentOrder() {
  return useMutation({
    mutationKey: paymentKeys.orders(),
    mutationFn: (payload: CreatePaymentOrderRequest) => paymentService.createOrder(payload),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { refreshWallet } = useAuth();

  return useMutation({
    mutationKey: paymentKeys.verify(),
    mutationFn: (payload: VerifyPaymentRequest) => paymentService.verifyPayment(payload),
    onSuccess: async (_data: PaymentVerificationResponse) => {
      await refreshWallet();
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

export function useMyPurchases(params: PageQueryParams = {}) {
  const normalizedParams: PageQueryParams = {
    page: params.page ?? 0,
    limit: params.limit ?? 10,
  };

  return useQuery({
    queryKey: paymentKeys.purchases(normalizedParams),
    queryFn: () => paymentService.getMyPurchases(normalizedParams),
    placeholderData: (previousData) => previousData,
  });
}