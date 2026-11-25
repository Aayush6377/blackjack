import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { AdminTicketFiltersBar } from "../../components/admin/support/AdminTicketFiltersBar";
import { AdminTicketsTable } from "../../components/admin/support/AdminTicketsTable";
import { ResolveTicketModal } from "../../components/admin/support/ResolveTicketModal";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useAdminSupportTickets, useResolveSupportTicket } from "../../hooks/useSupportTickets";
import type {
  ResolveSupportTicketRequest,
  SupportTicketResponse,
  TicketCategory,
  TicketStatus,
} from "../../types/support";


const SEARCH_DEBOUNCE_MS = 350;

export default function AdminSupportTicketsPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "">("");
  const [activeTicket, setActiveTicket] =
    useState<SupportTicketResponse | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const pageRequest = useMemo(
    () => ({
      page,
      limit: 10,
      orderBy: "createdAt",
      direction: "DESC" as const,
      search: debouncedSearch,
      filters: {
        status: statusFilter || null,
        category: categoryFilter || null,
      },
    }),
    [page, debouncedSearch, statusFilter, categoryFilter]
  );

  const ticketsQuery = useAdminSupportTickets(pageRequest);
  const resolveMutation = useResolveSupportTicket();

  const handleResolveTicket = async (
    ticketId: string,
    payload: ResolveSupportTicketRequest
  ) => {
    await resolveMutation.mutateAsync({ ticketId, payload });
  };

  const errorMessage =
    ticketsQuery.error instanceof Error
      ? ticketsQuery.error.message
      : "Failed to load support tickets.";

  const refreshButton = (
    <button
      type="button"
      onClick={() => void ticketsQuery.refetch()}
      disabled={ticketsQuery.isFetching}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/55 hover:bg-amber-500/20"
    >
      <RotateCcw
        className={`h-3.5 w-3.5 ${ticketsQuery.isFetching ? "animate-spin" : ""}`}
      />
      <span>Refresh</span>
    </button>
  );

  return (
    <div>
      <AdminPageHeader
        title="Support Tickets"
        subtitle="Review user queries, update ticket status, and send admin resolutions."
        action={refreshButton}
      />

      {ticketsQuery.isError && !ticketsQuery.data ? (
        <div className="flex min-h-[40vh] w-full items-center justify-center">
          <BlackjackErrorState
            title="Failed to load support tickets"
            message={errorMessage}
            onRetry={() => void ticketsQuery.refetch()}
          />
        </div>
      ) : (
        <>
          <AdminTicketFiltersBar
            search={searchInput}
            onSearchChange={setSearchInput}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setPage(0);
            }}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={(val) => {
              setCategoryFilter(val);
              setPage(0);
            }}
          />

          <AdminTicketsTable
            data={ticketsQuery.data}
            isLoading={ticketsQuery.isLoading && !ticketsQuery.data}
            onPageChange={setPage}
            onOpenTicket={setActiveTicket}
          />
        </>
      )}

      <ResolveTicketModal
        ticket={activeTicket}
        onClose={() => setActiveTicket(null)}
        onResolve={handleResolveTicket}
        isSubmitting={resolveMutation.isPending}
      />
    </div>
  );
}