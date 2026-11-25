import { apiClient } from "../lib/apiClient";
import { extractBackendMessage } from "../utils/apiError";
import {
  createSupportTicketSchema,
  resolveSupportTicketSchema,
  supportTicketPageResponseSchema,
  supportTicketResponseSchema,
} from "../schema/support.schema";
import type {
  CreateSupportTicketRequest,
  PageRequestPayload,
  PageResponsePayload,
  ResolveSupportTicketRequest,
  SupportTicketFilter,
  SupportTicketResponse,
} from "../types/support";

const USER_TICKETS_BASE = "/support/tickets";
const ADMIN_TICKETS_BASE = "/admin/support/tickets";

function normalizePageRequest(req?: PageRequestPayload<SupportTicketFilter>): PageRequestPayload<SupportTicketFilter> {
  return {
    page: req?.page ?? 0,
    limit: req?.limit ?? 10,
    orderBy: req?.orderBy ?? "createdAt",
    direction: req?.direction ?? "DESC",
    search: req?.search?.trim() ?? "",
    filters: req?.filters ?? null,
  };
}

export const userSupportService = {
  async createTicket(payload: CreateSupportTicketRequest): Promise<SupportTicketResponse> {
    const parsedInput = createSupportTicketSchema.parse(payload);
    try {
      const { data } = await apiClient.post(USER_TICKETS_BASE, parsedInput);
      return supportTicketResponseSchema.parse(data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to submit support ticket."));
    }
  },

  async searchMyTickets(pageRequest?: PageRequestPayload<SupportTicketFilter>): Promise<PageResponsePayload<SupportTicketResponse>> {
    try {
      const { data } = await apiClient.post(
        `${USER_TICKETS_BASE}/me/search`,
        normalizePageRequest(pageRequest)
      );
      return supportTicketPageResponseSchema.parse(data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load your support tickets."));
    }
  },

  async getMyTicketById(ticketId: string): Promise<SupportTicketResponse> {
    try {
      const { data } = await apiClient.get(`${USER_TICKETS_BASE}/me/${ticketId}`);
      return supportTicketResponseSchema.parse(data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load support ticket details."));
    }
  },
};

export const adminSupportService = {
  async searchTickets(pageRequest?: PageRequestPayload<SupportTicketFilter>): Promise<PageResponsePayload<SupportTicketResponse>> {
    try {
      const { data } = await apiClient.post(
        `${ADMIN_TICKETS_BASE}/search`,
        normalizePageRequest(pageRequest)
      );
      return supportTicketPageResponseSchema.parse(data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load support tickets."));
    }
  },

  async getTicketById(ticketId: string): Promise<SupportTicketResponse> {
    try {
      const { data } = await apiClient.get(`${ADMIN_TICKETS_BASE}/${ticketId}`);
      return supportTicketResponseSchema.parse(data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to load support ticket details."));
    }
  },

  async resolveTicket(ticketId: string, payload: ResolveSupportTicketRequest): Promise<SupportTicketResponse> {
    const parsedInput = resolveSupportTicketSchema.parse(payload);
    try {
      const { data } = await apiClient.patch(
        `${ADMIN_TICKETS_BASE}/${ticketId}/resolve`,
        parsedInput
      );
      return supportTicketResponseSchema.parse(data);
    } catch (err) {
      throw new Error(extractBackendMessage(err, "Failed to resolve support ticket."));
    }
  },
};