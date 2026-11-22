import { ArrowDown, ArrowUp, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import type { HandOutcome, RoundStatus } from "../../types/replay";

export type StatusFilterValue = "ALL" | RoundStatus;
export type OutcomeFilterValue = "ALL" | HandOutcome;

export interface ReplayFilterState {
  search: string;
  status: StatusFilterValue;
  outcome: OutcomeFilterValue;
  orderBy: string;
  direction: "ASC" | "DESC";
  limit: number;
}

interface ReplayFiltersBarProps {
  filters: ReplayFilterState;
  totalElements: number;
  onChange: (next: Partial<ReplayFilterState>) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { value: "startedAt", label: "Started Date" },
  { value: "completedAt", label: "Completed Date" },
  { value: "totalBet", label: "Total Bet" },
  { value: "totalPayout", label: "Total Payout" },
  { value: "netResult", label: "Net Result" },
];

const STATUS_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "ABANDONED", label: "Abandoned" },
  { value: "WAITING", label: "Waiting" },
];

const OUTCOME_OPTIONS: { value: OutcomeFilterValue; label: string }[] = [
  { value: "ALL", label: "All Outcomes" },
  { value: "BLACKJACK_WIN", label: "Blackjack Win" },
  { value: "WIN", label: "Win" },
  { value: "PUSH", label: "Push" },
  { value: "LOSS", label: "Loss" },
  { value: "BUST", label: "Bust" },
  { value: "SURRENDER", label: "Surrender" },
];

const LIMIT_OPTIONS = [5, 10, 20, 50];

export function ReplayFiltersBar({
  filters,
  totalElements,
  onChange,
  onReset,
}: ReplayFiltersBarProps) {
  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.status !== "ALL" ||
    filters.outcome !== "ALL" ||
    filters.orderBy !== "startedAt" ||
    filters.direction !== "DESC" ||
    filters.limit !== 10;

  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/85 p-4 shadow-xl shadow-black/50 sm:p-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300/90">
          <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
          <span>Search, Filter &amp; Sort Rounds</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            Showing <strong className="text-zinc-200">{totalElements}</strong>{" "}
            {totalElements === 1 ? "round" : "rounds"}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-amber-400/40 hover:text-amber-300"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:col-span-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search room, status, or outcome..."
            aria-label="Search rounds"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-3.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
          />
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({ status: e.target.value as StatusFilterValue })
            }
            aria-label="Filter by round status"
            className="w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-950">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Outcome Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.outcome}
            onChange={(e) =>
              onChange({ outcome: e.target.value as OutcomeFilterValue })
            }
            aria-label="Filter by outcome"
            className="w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
          >
            {OUTCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-950">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Field + Direction */}
        <div className="flex gap-2 lg:col-span-2">
          <select
            value={filters.orderBy}
            onChange={(e) => onChange({ orderBy: e.target.value })}
            aria-label="Sort by field"
            className="w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/15"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-950">
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() =>
              onChange({
                direction: filters.direction === "DESC" ? "ASC" : "DESC",
              })
            }
            title={
              filters.direction === "DESC"
                ? "Descending (click for Ascending)"
                : "Ascending (click for Descending)"
            }
            aria-label="Toggle sort direction"
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 text-amber-300 transition hover:border-amber-400/50 hover:bg-zinc-800"
          >
            {filters.direction === "DESC" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Page Size (Limit) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5 text-sm">
            <span className="text-xs text-zinc-400">Limit</span>
            <select
              value={filters.limit}
              onChange={(e) => onChange({ limit: Number(e.target.value) })}
              aria-label="Rows per page"
              className="cursor-pointer bg-transparent font-semibold text-amber-300 outline-none"
            >
              {LIMIT_OPTIONS.map((size) => (
                <option key={size} value={size} className="bg-zinc-950 text-zinc-100">
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}