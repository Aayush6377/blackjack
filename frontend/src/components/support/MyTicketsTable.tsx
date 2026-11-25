import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Search,
} from "lucide-react";
import type {
  PageResponsePayload,
  SupportTicketResponse,
  TicketCategory,
  TicketStatus,
} from "../../types/support";

interface MyTicketsTableProps {
  data?: PageResponsePayload<SupportTicketResponse>;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: TicketStatus | "";
  onStatusFilterChange: (val: TicketStatus | "") => void;
  categoryFilter: TicketCategory | "";
  onCategoryFilterChange: (val: TicketCategory | "") => void;
  onPageChange: (nextPage: number) => void;
  onSelectTicket: (ticket: SupportTicketResponse) => void;
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  OPEN: "border-amber-400/35 bg-amber-500/15 text-amber-300",
  IN_PROGRESS: "border-sky-400/35 bg-sky-500/15 text-sky-300",
  RESOLVED: "border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
  CLOSED: "border-neutral-700 bg-neutral-800 text-neutral-300",
};

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  PAYMENT_OR_CHIPS: "Payment & Chips",
  GAMEPLAY_OR_ROOM: "Gameplay & Rooms",
  ACCOUNT: "Account & Security",
  BUG_REPORT: "Bug Report",
  OTHER: "Other Query",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function MyTicketsTable({
  data,
  isLoading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onPageChange,
  onSelectTicket,
}: MyTicketsTableProps) {
  const items = data?.items ?? [];

  return (
    <section className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 shadow-xl shadow-black/35 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            Previous Tickets
          </div>
          <h2 className="text-base font-bold text-white sm:text-lg">
            Your Queries &amp; Resolutions
          </h2>
        </div>

        {data && (
          <span className="w-fit rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 font-mono text-xs text-zinc-300">
            {data.totalElements}{" "}
            {data.totalElements === 1 ? "ticket" : "tickets"}
          </span>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subject or message..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2 pr-3 pl-9 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-400/60 sm:text-sm"
          />
        </div>

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange((e.target.value || "") as TicketStatus | "")
          }
          className="rounded-xl border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-xs text-zinc-100 outline-none transition focus:border-amber-400/60 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) =>
            onCategoryFilterChange(
              (e.target.value || "") as TicketCategory | ""
            )
          }
          className="rounded-xl border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-xs text-zinc-100 outline-none transition focus:border-amber-400/60 sm:text-sm"
        >
          <option value="">All Categories</option>
          <option value="PAYMENT_OR_CHIPS">Payment &amp; Chips</option>
          <option value="GAMEPLAY_OR_ROOM">Gameplay &amp; Rooms</option>
          <option value="ACCOUNT">Account &amp; Security</option>
          <option value="BUG_REPORT">Bug Report</option>
          <option value="OTHER">Other Query</option>
        </select>
      </div>

      {/* Skeleton Loader */}
      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60">
          <div className="h-10 border-b border-zinc-800/80 bg-zinc-900/70" />
          <div className="divide-y divide-zinc-800/70 p-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="my-1.5 h-12 animate-pulse rounded-lg bg-zinc-900/80"
              />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 px-4 py-12 text-center">
          <Inbox className="mb-2.5 h-8 w-8 text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-200">
            No support tickets found
          </p>
          <p className="mt-1 max-w-sm text-xs text-zinc-400">
            Submit a ticket on the left to ask an admin for help, or reset your
            filters to view earlier tickets.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800/90 bg-zinc-950/75">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/90 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Resolution</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {items.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="cursor-pointer transition hover:bg-zinc-900/70"
                >
                  <td className="max-w-[200px] px-4 py-3.5">
                    <div className="truncate font-semibold text-white">
                      {ticket.subject}
                    </div>
                    <div className="truncate text-xs text-zinc-400">
                      {ticket.message}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-zinc-300">
                    {CATEGORY_LABEL[ticket.category]}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        STATUS_BADGE[ticket.status]
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>

                  <td className="max-w-[220px] px-4 py-3.5 text-xs">
                    {ticket.adminResolution ? (
                      <span className="line-clamp-2 text-emerald-300">
                        {ticket.adminResolution}
                      </span>
                    ) : (
                      <span className="italic text-zinc-500">
                        Pending reply
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-zinc-400">
                    {formatDate(ticket.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTicket(ticket);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-amber-400/40 hover:text-amber-300"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
          <span>
            Page <strong className="text-zinc-200">{data.page + 1}</strong> of{" "}
            <strong className="text-zinc-200">{data.totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPrevious || isLoading}
              onClick={() => onPageChange(data.page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-semibold text-zinc-200 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <button
              type="button"
              disabled={!data.hasNext || isLoading}
              onClick={() => onPageChange(data.page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-semibold text-zinc-200 transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}