import { Search } from "lucide-react";
import type { TicketCategory, TicketStatus } from "../../../types/support";

interface AdminTicketFiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: TicketStatus | "";
  onStatusFilterChange: (value: TicketStatus | "") => void;
  categoryFilter: TicketCategory | "";
  onCategoryFilterChange: (value: TicketCategory | "") => void;
}

export function AdminTicketFiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}: AdminTicketFiltersBarProps) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search user, subject, or message..."
          className="w-full rounded-xl border border-neutral-800 bg-neutral-950/90 py-2 pr-3 pl-9 text-xs text-slate-100 placeholder-neutral-500 outline-none transition focus:border-amber-400/60 sm:text-sm"
        />
      </div>

      <select
        aria-label="Filter tickets by status"
        value={statusFilter}
        onChange={(e) =>
          onStatusFilterChange((e.target.value || "") as TicketStatus | "")
        }
        className="rounded-xl border border-neutral-800 bg-neutral-950/90 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-amber-400/60 sm:text-sm"
      >
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>

      <select
        aria-label="Filter tickets by category"
        value={categoryFilter}
        onChange={(e) =>
          onCategoryFilterChange((e.target.value || "") as TicketCategory | "")
        }
        className="rounded-xl border border-neutral-800 bg-neutral-950/90 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-amber-400/60 sm:text-sm"
      >
        <option value="">All Categories</option>
        <option value="PAYMENT_OR_CHIPS">Payment &amp; Chips</option>
        <option value="GAMEPLAY_OR_ROOM">Gameplay &amp; Rooms</option>
        <option value="ACCOUNT">Account &amp; Security</option>
        <option value="BUG_REPORT">Bug Report</option>
        <option value="OTHER">Other Query</option>
      </select>
    </div>
  );
}