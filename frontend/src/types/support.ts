export type TicketCategory =
  | "PAYMENT_OR_CHIPS"
  | "GAMEPLAY_OR_ROOM"
  | "ACCOUNT"
  | "BUG_REPORT"
  | "OTHER";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type SortDirection = "ASC" | "DESC";

export interface SupportTicketFilter {
  status?: TicketStatus | null;
  category?: TicketCategory | null;
}

export interface PageRequestPayload<TFilters = Record<string, unknown>> {
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: SortDirection;
  search?: string;
  filters?: TFilters | null;
}

export interface PageResponsePayload<TItem> {
  items: TItem[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreateSupportTicketRequest {
  subject: string;
  category: TicketCategory;
  message: string;
}

export interface ResolveSupportTicketRequest {
  status: TicketStatus;
  adminResolution: string;
}

export interface SupportTicketResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  message: string;
  status: TicketStatus;
  adminResolution: string | null;
  resolvedByAdminId: string | null;
  resolvedByAdminName: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}