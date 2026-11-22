import { ArrowDown, ArrowUp, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export interface AuditFilterBarProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  actionFilter: string;
  onActionChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  direction: "ASC" | "DESC";
  onToggleDirection: () => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  totalElements: number;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const ACTION_OPTIONS = [
  { label: "All Actions", value: "" },
  { label: "CREATE", value: "CREATE" },
  { label: "BULK_CREATE", value: "BULK_CREATE" },
  { label: "UPDATE", value: "UPDATE" },
  { label: "DELETE", value: "DELETE" },
  { label: "BULK_DELETE", value: "BULK_DELETE" },
] as const;

const LIMIT_OPTIONS = [5, 10, 20, 50] as const;

export function AuditFilterBar({
  searchInput,
  onSearchChange,
  actionFilter,
  onActionChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  direction,
  onToggleDirection,
  limit,
  onLimitChange,
  totalElements,
  onReset,
  hasActiveFilters,
}: AuditFilterBarProps) {
  return (
    <section
      aria-label="Search, filter and sort audit logs"
      className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-4 shadow-lg shadow-black/30 space-y-4"
    >
      {/* Top Row: Label + Total Count */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Search, Filter &amp; Sort Audit Logs</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>
            Showing{" "}
            <strong className="font-mono font-semibold text-slate-100">
              {totalElements}
            </strong>{" "}
            {totalElements === 1 ? "log" : "logs"}
          </span>

          {hasActiveFilters && (
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

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search admin, action, or ID..."
            aria-label="Search audit logs"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/85 py-2 pr-3.5 pl-10 text-sm text-slate-100 placeholder:text-neutral-500 transition focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        {/* Action Filter */}
        <select
          aria-label="Filter by action"
          value={actionFilter}
          onChange={(e) => onActionChange(e.target.value)}
          className="h-[38px] cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-sm text-slate-100 transition focus:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* From Date */}
        <label className="flex h-[38px] items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-xs text-neutral-400 focus-within:border-amber-400/60">
          <span className="font-medium text-neutral-400">From</span>
          <input
            type="datetime-local"
            aria-label="From date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="bg-transparent font-mono text-xs text-slate-100 focus:outline-none [color-scheme:dark]"
          />
        </label>

        {/* To Date */}
        <label className="flex h-[38px] items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-xs text-neutral-400 focus-within:border-amber-400/60">
          <span className="font-medium text-neutral-400">To</span>
          <input
            type="datetime-local"
            aria-label="To date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="bg-transparent font-mono text-xs text-slate-100 focus:outline-none [color-scheme:dark]"
          />
        </label>

        {/* Ascending / Descending Toggle */}
        <button
          type="button"
          onClick={onToggleDirection}
          title={
            direction === "DESC"
              ? "Sorted Descending (Newest first) — Click for Ascending"
              : "Sorted Ascending (Oldest first) — Click for Descending"
          }
          aria-label={
            direction === "DESC"
              ? "Sort descending, click to sort ascending"
              : "Sort ascending, click to sort descending"
          }
          className="inline-flex h-[38px] cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-xs font-semibold text-amber-300 transition hover:border-amber-400/50 hover:bg-neutral-900"
        >
          {direction === "DESC" ? (
            <>
              <ArrowDown className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">DESC</span>
            </>
          ) : (
            <>
              <ArrowUp className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">ASC</span>
            </>
          )}
        </button>

        {/* Limit Selector (5, 10, 20, 50; default 10) */}
        <label className="flex h-[38px] items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-xs text-neutral-400 focus-within:border-amber-400/60">
          <span>Limit</span>
          <select
            aria-label="Results per page limit"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="cursor-pointer bg-transparent font-mono text-xs font-bold text-amber-400 focus:outline-none"
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option
                key={opt}
                value={opt}
                className="bg-neutral-900 text-slate-100"
              >
                {opt} / page
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}