import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSupportService, userSupportService } from "../services/supportService";
import type {
  CreateSupportTicketRequest,
  PageRequestPayload,
  ResolveSupportTicketRequest,
  SupportTicketFilter,
} from "../types/support";

export const SUPPORT_QUERY_KEYS = {
  all: ["support"] as const,
  userAll: () => [...SUPPORT_QUERY_KEYS.all, "user"] as const,
  myTickets: (pageRequest?: PageRequestPayload<SupportTicketFilter>) =>
    [...SUPPORT_QUERY_KEYS.userAll(), "tickets", pageRequest ?? {}] as const,
  myTicketDetail: (ticketId: string) =>
    [...SUPPORT_QUERY_KEYS.userAll(), "tickets", "detail", ticketId] as const,

  adminAll: () => [...SUPPORT_QUERY_KEYS.all, "admin"] as const,
  adminTickets: (pageRequest?: PageRequestPayload<SupportTicketFilter>) =>
    [...SUPPORT_QUERY_KEYS.adminAll(), "tickets", pageRequest ?? {}] as const,
  adminTicketDetail: (ticketId: string) =>
    [...SUPPORT_QUERY_KEYS.adminAll(), "tickets", "detail", ticketId] as const,
};

export function useMySupportTickets(
  pageRequest?: PageRequestPayload<SupportTicketFilter>
) {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.myTickets(pageRequest),
    queryFn: () => userSupportService.searchMyTickets(pageRequest),
    placeholderData: (previousData) => previousData,
  });
}

export function useMySupportTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.myTicketDetail(ticketId ?? ""),
    queryFn: () => userSupportService.getMyTicketById(ticketId!),
    enabled: Boolean(ticketId),
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupportTicketRequest) => userSupportService.createTicket(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.userAll() });
      void queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.adminAll() });
    },
  });
}

export function useAdminSupportTickets(
  pageRequest?: PageRequestPayload<SupportTicketFilter>
) {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.adminTickets(pageRequest),
    queryFn: () => adminSupportService.searchTickets(pageRequest),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminSupportTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: SUPPORT_QUERY_KEYS.adminTicketDetail(ticketId ?? ""),
    queryFn: () => adminSupportService.getTicketById(ticketId!),
    enabled: Boolean(ticketId),
  });
}

export function useResolveSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }: {
      ticketId: string;
      payload: ResolveSupportTicketRequest;
    }) => adminSupportService.resolveTicket(ticketId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        SUPPORT_QUERY_KEYS.adminTicketDetail(updated.id),
        updated
      );
      void queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.adminAll() });
      void queryClient.invalidateQueries({ queryKey: SUPPORT_QUERY_KEYS.userAll() });
    },
  });
}