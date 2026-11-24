import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { couponService } from "../services/couponService";
import type { CreateCouponRequest, RedeemCouponRequest, UpdateCouponRequest } from "../types/coupon";
import { walletKeys } from "./useWallet";

export const couponKeys = {
  all: ["coupons"] as const,
  adminList: () => [...couponKeys.all, "admin"] as const,
  adminDetail: (id: string) => [...couponKeys.all, "admin", id] as const,
  myRedemptions: () => [...couponKeys.all, "redemptions", "me"] as const,
};

// User hooks
export function useMyCouponRedemptions() {
  return useQuery({
    queryKey: couponKeys.myRedemptions(),
    queryFn: () => couponService.getMyRedemptions(),
  });
}

export function useRedeemCoupon() {
  const queryClient = useQueryClient();
  const { refreshWallet, setWalletBalanceFromSnapshot } = useAuth();

  return useMutation({
    mutationFn: (payload: RedeemCouponRequest) => couponService.redeemCoupon(payload),
    onSuccess: async (data) => {
      setWalletBalanceFromSnapshot(data.updatedWalletBalance);
      await refreshWallet();
      void queryClient.invalidateQueries({ queryKey: couponKeys.myRedemptions() });
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

// Admin hooks
export function useAdminCoupons() {
  return useQuery({
    queryKey: couponKeys.adminList(),
    queryFn: () => couponService.listAllCoupons(),
  });
}

export function useAdminCoupon(couponId: string | undefined) {
  return useQuery({
    queryKey: couponKeys.adminDetail(couponId ?? ""),
    queryFn: () => couponService.getAdminCouponById(couponId!),
    enabled: Boolean(couponId),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCouponRequest) => couponService.createCoupon(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.adminList() });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ couponId, payload }: { couponId: string; payload: UpdateCouponRequest }) => couponService.updateCoupon(couponId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.adminList() });
      void queryClient.invalidateQueries({
        queryKey: couponKeys.adminDetail(variables.couponId),
      });
    },
  });
}

export function useSetCouponActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ couponId, active }: { couponId: string; active: boolean }) => couponService.setCouponActive(couponId, active),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.adminList() });
      void queryClient.invalidateQueries({
        queryKey: couponKeys.adminDetail(variables.couponId),
      });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: string) => couponService.deleteCoupon(couponId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: couponKeys.adminList() });
    },
  });
}