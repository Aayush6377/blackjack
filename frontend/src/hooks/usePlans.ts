import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { planService } from "../services/planService";
import type { CreateChipPlanRequest, UpdateChipPlanRequest } from "../types/plan";

export const planKeys = {
  all: ["plans"] as const,
  activeList: () => [...planKeys.all, "active"] as const,
  activeDetail: (id: string) => [...planKeys.all, "active", id] as const,
  adminList: () => [...planKeys.all, "admin"] as const,
  adminDetail: (id: string) => [...planKeys.all, "admin", id] as const,
};

export function useActivePlans() {
  return useQuery({
    queryKey: planKeys.activeList(),
    queryFn: () => planService.getActivePlans(),
  });
}

export function useActivePlan(planId: string | undefined) {
  return useQuery({
    queryKey: planKeys.activeDetail(planId ?? ""),
    queryFn: () => planService.getActivePlanById(planId!),
    enabled: Boolean(planId),
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: planKeys.adminList(),
    queryFn: () => planService.listAllPlans(),
  });
}

export function useAdminPlan(planId: string | undefined) {
  return useQuery({
    queryKey: planKeys.adminDetail(planId ?? ""),
    queryFn: () => planService.getAdminPlanById(planId!),
    enabled: Boolean(planId),
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChipPlanRequest) => planService.createPlan(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: UpdateChipPlanRequest }) =>
      planService.updatePlan(planId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => planService.deletePlan(planId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: planKeys.all });
    },
  });
}