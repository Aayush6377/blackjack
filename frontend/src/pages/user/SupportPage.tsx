import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { MyTicketsTable } from "../../components/support/MyTicketsTable";
import { RaiseTicketForm } from "../../components/support/RaiseTicketForm";
import { TicketDetailModal } from "../../components/support/TicketDetailModal";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useMySupportTickets } from "../../hooks/useSupportTickets";
import type {
  SupportTicketResponse,
  TicketCategory,
  TicketStatus,
} from "../../types/support";

const SEARCH_DEBOUNCE_MS = 350;

export default function SupportPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "">("");
  const [selectedTicket, setSelectedTicket] =
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
      limit: 6,
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

  const ticketsQuery = useMySupportTickets(pageRequest);

  const errorMessage =
    ticketsQuery.error instanceof Error
      ? ticketsQuery.error.message
      : "Unable to load your support tickets.";

  const handleStatusChange = (value: TicketStatus | "") => {
    setStatusFilter(value);
    setPage(0);
  };

  const handleCategoryChange = (value: TicketCategory | "") => {
    setCategoryFilter(value);
    setPage(0);
  };

  return (
    <section className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* User Page Header */}
        <div className="mb-6 flex items-start justify-between gap-3 sm:items-end">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 sm:text-xs">
              Blackjack Royale · Support
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Support Center
            </h1>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              Raise a ticket to ask admins for help or check resolutions on your
              previous queries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void ticketsQuery.refetch()}
            disabled={ticketsQuery.isFetching}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/55 hover:bg-amber-500/20 sm:px-3.5"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 shrink-0 ${
                ticketsQuery.isFetching ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {ticketsQuery.isError && !ticketsQuery.data ? (
          <div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">
            <BlackjackErrorState
              title="Failed to load support tickets"
              message={errorMessage}
              onRetry={() => void ticketsQuery.refetch()}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <RaiseTicketForm />
            </div>

            <div className="lg:col-span-8">
              <MyTicketsTable
                data={ticketsQuery.data}
                isLoading={ticketsQuery.isLoading && !ticketsQuery.data}
                search={searchInput}
                onSearchChange={setSearchInput}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusChange}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={handleCategoryChange}
                onPageChange={setPage}
                onSelectTicket={setSelectedTicket}
              />
            </div>
          </div>
        )}

        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      </div>
    </section>
  );
}