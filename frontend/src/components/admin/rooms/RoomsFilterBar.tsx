import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export type RoomStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export interface RoomsFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RoomStatusFilter;
  onStatusFilterChange: (value: RoomStatusFilter) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export function RoomsFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
  onReset,
}: RoomsFilterBarProps) {
  const hasActiveFilter = Boolean(search.trim()) || statusFilter !== "ALL";

  return (
    <section
      aria-label="Search and filter game rooms"
      className="space-y-3 rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Search &amp; Filter Rooms</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>
            Showing{" "}
            <strong className="font-mono font-semibold text-slate-100">
              {filteredCount}
            </strong>{" "}
            of{" "}
            <strong className="font-mono font-semibold text-slate-100">
              {totalCount}
            </strong>{" "}
            rooms
          </span>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-700/80 bg-neutral-800/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-300 transition hover:border-amber-400/40 hover:text-amber-200"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by room name, slug, or difficulty..."
            aria-label="Search game rooms"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/85 py-2 pr-3.5 pl-10 text-sm text-slate-100 placeholder:text-neutral-500 transition focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <select
          aria-label="Filter rooms by status"
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as RoomStatusFilter)
          }
          className="h-[38px] cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950/85 px-3.5 text-sm text-slate-100 transition focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        >
          <option value="ALL">All Rooms</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>
    </section>
  );
}