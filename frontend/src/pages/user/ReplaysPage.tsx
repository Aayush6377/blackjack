import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, RefreshCw } from "lucide-react";
import {
  ReplayFiltersBar,
  type ReplayFilterState,
} from "../../components/replay/ReplayFiltersBar";
import { ReplayPaginationBar } from "../../components/replay/ReplayPaginationBar";
import { RoundsListView } from "../../components/replay/RoundsListView";
import { useReplayRounds } from "../../hooks/useReplays";

const DEFAULT_FILTERS: ReplayFilterState = {
  search: "",
  status: "ALL",
  outcome: "ALL",
  orderBy: "startedAt",
  direction: "DESC",
  limit: 10,
};

export default function ReplaysPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReplayFilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const effectiveSearch = useMemo(() => {
    const parts: string[] = [];
    if (debouncedSearch) parts.push(debouncedSearch);
    if (filters.status !== "ALL") parts.push(filters.status);
    if (filters.outcome !== "ALL") parts.push(filters.outcome);
    return parts.join(" ").trim();
  }, [debouncedSearch, filters.status, filters.outcome]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useReplayRounds({
    page,
    limit: filters.limit,
    orderBy: filters.orderBy,
    direction: filters.direction,
    search: effectiveSearch,
  });

  const visibleRounds = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((item) => {
      const matchesStatus =
        filters.status === "ALL" || item.status === filters.status;
      const matchesOutcome =
        filters.outcome === "ALL" || item.outcome === filters.outcome;
      return matchesStatus && matchesOutcome;
    });
  }, [data?.items, filters.status, filters.outcome]);

  const handleFilterChange = (next: Partial<ReplayFilterState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(0);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch("");
    setPage(0);
  };

  const handleReplay = (roundId: string) => {
    navigate(`/replays/${roundId}`);
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.14),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <button
              type="button"
              onClick={() => navigate("/rooms")}
              className="mb-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-amber-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Game Rooms</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <History className="h-3.5 w-3.5" />
              <span>Blackjack Royale · Match Archive</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Game Rounds &amp; Replays
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Browse your past hands, check payouts, and replay completed rounds action by
              action.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:border-amber-400/40 hover:text-white disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <ReplayFiltersBar
          filters={filters}
          totalElements={data?.totalElements ?? 0}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-14 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
            <div className="h-14 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50" />
            <div className="h-14 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
            <div className="h-14 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/30" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-8 text-center">
            <p className="text-sm text-rose-200">
              {error?.message || "Unable to load game rounds right now."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-300"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <RoundsListView rounds={visibleRounds} onReplay={handleReplay} />

            {data && (
              <ReplayPaginationBar
                page={data.page}
                limit={data.limit}
                totalElements={data.totalElements}
                totalPages={data.totalPages}
                hasPrevious={data.hasPrevious}
                hasNext={data.hasNext}
                onPageChange={(nextPage) => setPage(nextPage)}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}