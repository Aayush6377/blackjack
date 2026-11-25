import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUserService } from "../services/adminUserService";
import type { AdjustUserChipsRequest } from "../types/adminUser";
import type { PageQueryParams } from "../types/page";

export const adminUserKeys = {
  all: ["admin-users"] as const,
  list: (params: PageQueryParams) =>
    [ ...adminUserKeys.all, "list",
      {
        page: params.page ?? 0,
        limit: params.limit ?? 10,
        orderBy: params.orderBy ?? "createdAt",
        direction: params.direction ?? "DESC",
        search: params.search?.trim() ?? "",
      },
    ] as const,
  detail: (userId: string) => [...adminUserKeys.all, "detail", userId] as const,
  purchases: (userId: string, params: PageQueryParams) =>
    [ ...adminUserKeys.all, "purchases",
      userId,
      {
        page: params.page ?? 0,
        limit: params.limit ?? 10,
      },
    ] as const,
};

export function useAdminUsers(params: PageQueryParams = {}) {
  const normalized: PageQueryParams = {
    page: params.page ?? 0,
    limit: params.limit ?? 10,
    orderBy: params.orderBy ?? "createdAt",
    direction: params.direction ?? "DESC",
    search: params.search?.trim() ?? "",
  };

  return useQuery({
    queryKey: adminUserKeys.list(normalized),
    queryFn: () => adminUserService.getUsers(normalized),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminUserDetail(userId: string | undefined) {
  return useQuery({
    queryKey: adminUserKeys.detail(userId ?? ""),
    queryFn: () => adminUserService.getUserDetails(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdminUserPurchases( userId: string | undefined, params: PageQueryParams = {}) {
  const normalized: PageQueryParams = {
    page: params.page ?? 0,
    limit: params.limit ?? 10,
  };

  return useQuery({
    queryKey: adminUserKeys.purchases(userId ?? "", normalized),
    queryFn: () => adminUserService.getUserPurchases(userId!, normalized),
    enabled: Boolean(userId),
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateUserEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) =>
      adminUserService.updateUserEnabled(userId, enabled),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      void queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}

export function useAdjustUserChips() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdjustUserChipsRequest }) => 
        adminUserService.adjustUserChips(userId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      void queryClient.invalidateQueries({
        queryKey: adminUserKeys.detail(variables.userId),
      });
    },
  });
}