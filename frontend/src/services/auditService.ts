import { z } from "zod";
import { apiClient } from "../lib/apiClient";
import {
  adminAuditLogPageResponseSchema,
  adminAuditLogResponseSchema,
} from "../schema/audit.schema";
import type { AdminAuditLogFilter, AdminAuditLogResponse } from "../types/audit";
import type { PageQueryParams, PageResponse } from "../types/page";

const ADMIN_AUDIT_BASE = "/admin/audit-logs";

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn("Audit API payload schema mismatch:", result.error.flatten());
    return data as T;
  }
  return result.data;
}

function normalizeAuditQuery(
  query?: PageQueryParams<AdminAuditLogFilter>
): PageQueryParams<AdminAuditLogFilter> {
  const f = query?.filters;
  const cleanedFilters: AdminAuditLogFilter = {};

  if (f?.adminId) cleanedFilters.adminId = f.adminId;
  if (f?.action) cleanedFilters.action = f.action;
  if (f?.entityType) cleanedFilters.entityType = f.entityType;
  if (f?.entityId) cleanedFilters.entityId = f.entityId;
  if (f?.from) cleanedFilters.from = f.from;
  if (f?.to) cleanedFilters.to = f.to;

  return {
    page: query?.page ?? 0,
    limit: query?.limit ?? 10,
    orderBy: query?.orderBy ?? "createdAt",
    direction: query?.direction ?? "DESC",
    search: query?.search?.trim() ? query.search.trim() : undefined,
    filters: Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined,
  };
}

export const auditService = {
  async getAuditLogs(
    query?: PageQueryParams<AdminAuditLogFilter>
  ): Promise<PageResponse<AdminAuditLogResponse>> {
    const { data } = await apiClient.post<PageResponse<AdminAuditLogResponse>>(
      `${ADMIN_AUDIT_BASE}/search`,
      normalizeAuditQuery(query)
    );
    return parseWithSchema(adminAuditLogPageResponseSchema, data);
  },

  async getAuditLogById(logId: string): Promise<AdminAuditLogResponse> {
    const { data } = await apiClient.get<AdminAuditLogResponse>(
      `${ADMIN_AUDIT_BASE}/${logId}`
    );
    return parseWithSchema(adminAuditLogResponseSchema, data);
  },
};