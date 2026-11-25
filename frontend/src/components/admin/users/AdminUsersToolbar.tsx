import {
  ArrowDown,
  ArrowUp,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export type UserStatusFilter = "ALL" | "ENABLED" | "DISABLED";
export type UserSortField = "createdAt" | "name" | "email";

export interface AdminUsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: UserStatusFilter;
  onStatusFilterChange: (filter: UserStatusFilter) => void;
  orderBy: UserSortField;
  onOrderByChange: (field: UserSortField) => void;
  direction: "ASC" | "DESC";
  onToggleDirection: () => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  totalElements: number;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const LIMIT_OPTIONS = [5, 10, 20, 50] as const;

export function AdminUsersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  orderBy,
  onOrderByChange,
  direction,
  onToggleDirection,
  limit,
  onLimitChange,
  totalElements,
  onReset,
  hasActiveFilters,
}: AdminUsersToolbarProps) {
  return (
    <section
      aria-label="Search, filter and sort users"
      className="space-y-4 rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-4 shadow-lg shadow-black/30"
    >
      {/* Top Row: Label + Total Count */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Search, Filter &amp; Sort Users</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span>
            Showing{" "}
            <strong className="font-mono font-semibold text-slate-100">
              {totalElements}
            </strong>{" "}
            {totalElements === 1 ? "user" : "users"}
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
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search player name or email..."
            aria-label="Search users"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/85 py-2 pr-3.5 pl-10 text-sm text-slate-100 placeholder:text-neutral-500 transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <select
          aria-label="Filter by account status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as UserStatusFilter)}
          className="h-[38px] cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-sm text-slate-100 transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ENABLED">Enabled</option>
          <option value="DISABLED">Disabled</option>
        </select>

        {/* Sort By */}
        <select
          aria-label="Sort users by"
          value={orderBy}
          onChange={(e) => onOrderByChange(e.target.value as UserSortField)}
          className="h-[38px] cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950/85 px-3 text-sm text-slate-100 transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
        >
          <option value="createdAt">Joined Date</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>

        {/* Ascending / Descending Toggle */}
        <button
          type="button"
          onClick={onToggleDirection}
          title={
            direction === "DESC"
              ? "Sorted Descending — Click for Ascending"
              : "Sorted Ascending — Click for Descending"
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

        {/* Limit Selector */}
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