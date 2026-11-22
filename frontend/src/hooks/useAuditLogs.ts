import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/auditService";
import type { AdminAuditLogFilter } from "../types/audit";
import type { PageQueryParams } from "../types/page";

export const auditKeys = {
  all: ["admin-audit-logs"] as const,
  list: (query?: PageQueryParams<AdminAuditLogFilter>) =>
    [...auditKeys.all, "list", query ?? {}] as const,
  detail: (id: string) => [...auditKeys.all, "detail", id] as const,
};

export function useAdminAuditLogs(query?: PageQueryParams<AdminAuditLogFilter>) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => auditService.getAuditLogs(query),
  });
}

export function useAdminAuditLog(logId: string | undefined) {
  return useQuery({
    queryKey: auditKeys.detail(logId ?? ""),
    queryFn: () => auditService.getAuditLogById(logId!),
    enabled: Boolean(logId),
  });
}