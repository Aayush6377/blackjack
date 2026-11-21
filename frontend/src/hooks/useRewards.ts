import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rewardService } from "../services/rewardService";
import type {
  BulkCreateRewardConfigRequest,
  CreateRewardConfigRequest,
  UpdateRewardConfigRequest,
} from "../types/reward";
import { useAuth } from "./useAuth";

export const rewardKeys = {
  all: ["rewards"] as const,
  dailyStatus: () => [...rewardKeys.all, "daily", "status"] as const,
  adminConfigs: () => [...rewardKeys.all, "admin", "configs"] as const,
};

export function useDailyRewardStatus() {
  return useQuery({
    queryKey: rewardKeys.dailyStatus(),
    queryFn: () => rewardService.getDailyRewardStatus(),
    staleTime: 30_000,
  });
}

export function useClaimDailyReward() {
  const queryClient = useQueryClient();
  const { setWalletBalanceFromSnapshot } = useAuth();

  return useMutation({
    mutationFn: () => rewardService.claimDailyReward(),
    onSuccess: (claim) => {
      setWalletBalanceFromSnapshot(claim.walletBalanceAfter);
      void queryClient.invalidateQueries({ queryKey: rewardKeys.dailyStatus() });
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useAdminRewardConfigs() {
  return useQuery({
    queryKey: rewardKeys.adminConfigs(),
    queryFn: () => rewardService.listRewardConfigs(),
  });
}

export function useCreateRewardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRewardConfigRequest) => rewardService.createRewardConfig(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}

export function useBulkCreateRewardConfigs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCreateRewardConfigRequest) =>
      rewardService.bulkCreateRewardConfigs(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}

export function useUpdateRewardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      configId,
      payload,
    }: {
      configId: string;
      payload: UpdateRewardConfigRequest;
    }) => rewardService.updateRewardConfig(configId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}

export function useDeleteRewardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configId: string) => rewardService.deleteRewardConfig(configId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
}