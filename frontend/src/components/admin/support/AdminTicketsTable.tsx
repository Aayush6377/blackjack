import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  MessageSquareReply,
} from "lucide-react";
import type {
  PageResponsePayload,
  SupportTicketResponse,
} from "../../../types/support";
import {
  AdminTicketStatusBadge,
  formatTicketCategory,
} from "./AdminTicketStatusBadge";
import { AdminTicketsTableSkeleton } from "./AdminTicketsTableSkeleton";

interface AdminTicketsTableProps {
  data?: PageResponsePayload<SupportTicketResponse>;
  isLoading: boolean;
  onPageChange: (nextPage: number) => void;
  onOpenTicket: (ticket: SupportTicketResponse) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminTicketsTable({
  data,
  isLoading,
  onPageChange,
  onOpenTicket,
}: AdminTicketsTableProps) {
  const items = data?.items ?? [];

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-xl shadow-black/35 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            Support Queue
          </div>
          <h2 className="text-base font-bold text-slate-100 sm:text-lg">
            User Queries &amp; Resolutions
          </h2>
        </div>

        {data && (
          <span className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 font-mono text-xs text-neutral-300">
            {data.totalElements}{" "}
            {data.totalElements === 1 ? "ticket" : "tickets"}
          </span>
        )}
      </div>

      {isLoading ? (
        <AdminTicketsTableSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-950/50 px-4 py-12 text-center">
          <Inbox className="mb-2.5 h-8 w-8 text-neutral-500" />
          <p className="text-sm font-semibold text-slate-200">
            No support tickets match these filters
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Try changing the search term, status, or category filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800/90 bg-neutral-950/75">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Resolution</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/70">
              {items.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onOpenTicket(ticket)}
                  className="cursor-pointer transition hover:bg-neutral-900/75"
                >
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="font-semibold text-slate-100">
                      {ticket.userName}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {ticket.userEmail}
                    </div>
                  </td>

                  <td className="max-w-[220px] px-4 py-3.5">
                    <div className="truncate font-semibold text-slate-100">
                      {ticket.subject}
                    </div>
                    <div className="truncate text-xs text-neutral-400">
                      {ticket.message}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-neutral-300">
                    {formatTicketCategory(ticket.category)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5">
                    <AdminTicketStatusBadge status={ticket.status} />
                  </td>

                  <td className="max-w-[210px] px-4 py-3.5 text-xs">
                    {ticket.adminResolution ? (
                      <span className="line-clamp-2 text-emerald-300">
                        {ticket.adminResolution}
                      </span>
                    ) : (
                      <span className="italic text-neutral-500">
                        Awaiting resolution
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-neutral-400">
                    {formatDate(ticket.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTicket(ticket);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 transition hover:border-amber-400/60 hover:bg-amber-500/20"
                    >
                      <MessageSquareReply className="h-3.5 w-3.5" />
                      <span>
                        {ticket.status === "RESOLVED" ||
                        ticket.status === "CLOSED"
                          ? "Update"
                          : "Resolve"}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs text-neutral-400">
          <span>
            Page <strong className="text-slate-200">{data.page + 1}</strong> of{" "}
            <strong className="text-slate-200">{data.totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPrevious || isLoading}
              onClick={() => onPageChange(data.page - 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>

            <button
              type="button"
              disabled={!data.hasNext || isLoading}
              onClick={() => onPageChange(data.page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
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