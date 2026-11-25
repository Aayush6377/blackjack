import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import {
  adjustUserChipsRequestSchema,
  adjustUserChipsResponseSchema,
  adminUserDetailSchema,
  adminUserPurchasesPageSchema,
  adminUsersPageSchema,
  adminUserSummarySchema,
  updateUserStatusRequestSchema,
} from "../schema/adminUser.schema";
import type {
  AdjustUserChipsRequest,
  AdjustUserChipsResponse,
  AdminUserDetail,
  AdminUserPurchaseItem,
  AdminUserSummary,
} from "../types/adminUser";
import { extractBackendMessage } from "../utils/apiError";
import type { PageQueryParams, PageResponse } from "../types/page";

const ADMIN_USERS_BASE = "/admin/users";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Admin user API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

function toPageParams(params: PageQueryParams = {}) {
  return {
    page: params.page ?? 0,
    limit: params.limit ?? 10,
    ...(params.orderBy ? { orderBy: params.orderBy } : {}),
    ...(params.direction ? { direction: params.direction } : {}),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
  };
}

export const adminUserService = {
  async getUsers( params: PageQueryParams = {}): Promise<PageResponse<AdminUserSummary>> {
    try {
      const { data } = await apiClient.get<PageResponse<AdminUserSummary>>(
        ADMIN_USERS_BASE,
        { params: toPageParams(params) }
      );
      return parseWithSchema(adminUsersPageSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load users"));
    }
  },

  async getUserDetails(userId: string): Promise<AdminUserDetail> {
    try {
      const { data } = await apiClient.get<AdminUserDetail>(
        `${ADMIN_USERS_BASE}/${userId}`
      );
      return parseWithSchema(adminUserDetailSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load user details"));
    }
  },

  async getUserPurchases(userId: string, params: PageQueryParams = {} ): Promise<PageResponse<AdminUserPurchaseItem>> {
    try {
      const { data } = await apiClient.get<PageResponse<AdminUserPurchaseItem>>(
        `${ADMIN_USERS_BASE}/${userId}/purchases`,
        { params: toPageParams(params) }
      );
      return parseWithSchema(adminUserPurchasesPageSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load user purchase history"));
    }
  },

  async updateUserEnabled(userId: string, enabled: boolean ): Promise<AdminUserSummary> {
    const parsedPayload = updateUserStatusRequestSchema.parse({ enabled });
    try {
      const { data } = await apiClient.patch<AdminUserSummary>(
        `${ADMIN_USERS_BASE}/${userId}/enabled`,
        parsedPayload
      );
      return parseWithSchema(adminUserSummarySchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, enabled ? "Failed to enable user" : "Failed to disable user"));
    }
  },

  async adjustUserChips( userId: string, payload: AdjustUserChipsRequest ): Promise<AdjustUserChipsResponse> {
    const parsedPayload = adjustUserChipsRequestSchema.parse(payload);
    try {
      const { data } = await apiClient.post<AdjustUserChipsResponse>(
        `${ADMIN_USERS_BASE}/${userId}/chips/adjust`,
        parsedPayload
      );
      return parseWithSchema(adjustUserChipsResponseSchema, data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to adjust user chips"));
    }
  },
};