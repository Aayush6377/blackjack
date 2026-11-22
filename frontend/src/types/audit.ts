export interface AdminAuditLogFilter {
  adminId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

export interface AdminAuditLogResponse {
  id: string;
  adminId: string | null;
  adminUsername: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  createdAt: string;
}