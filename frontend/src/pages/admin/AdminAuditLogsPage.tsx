import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { AuditFilterBar } from "../../components/admin/audit/AuditFilterBar";
import { AuditLogsSkeleton } from "../../components/admin/audit/AuditLogsSkeleton";
import { AuditLogsTable } from "../../components/admin/audit/AuditLogsTable";
import { AuditLogDetailModal } from "../../components/admin/audit/AuditLogDetailModal";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import type { AdminAuditLogFilter, AdminAuditLogResponse } from "../../types/audit";
import type { PageQueryParams } from "../../types/page";
import { useAdminAuditLogs } from "../../hooks/useAuditLogs";

const DEFAULT_LIMIT = 10;

function toIsoOrValue(localDateTime: string): string | undefined {
  if (!localDateTime.trim()) return undefined;
  const parsed = new Date(localDateTime);
  return Number.isNaN(parsed.getTime()) ? localDateTime : parsed.toISOString();
}

export default function AdminAuditLogsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogResponse | null>(
    null
  );

  const [query, setQuery] = useState<PageQueryParams<AdminAuditLogFilter>>({
    page: 0,
    limit: DEFAULT_LIMIT,
    orderBy: "createdAt",
    direction: "DESC",
    search: "",
    filters: {},
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery((prev) => ({
        ...prev,
        page: 0,
        search: searchInput.trim(),
      }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const handleActionChange = (nextAction: string) => {
    setActionFilter(nextAction);
    setQuery((prev) => ({
      ...prev,
      page: 0,
      filters: {
        ...prev.filters,
        action: nextAction || undefined,
      },
    }));
  };

  const handleFromDateChange = (nextFrom: string) => {
    setFromDate(nextFrom);
    setQuery((prev) => ({
      ...prev,
      page: 0,
      filters: {
        ...prev.filters,
        from: toIsoOrValue(nextFrom),
      },
    }));
  };

  const handleToDateChange = (nextTo: string) => {
    setToDate(nextTo);
    setQuery((prev) => ({
      ...prev,
      page: 0,
      filters: {
        ...prev.filters,
        to: toIsoOrValue(nextTo),
      },
    }));
  };

  const handleToggleDirection = () => {
    setQuery((prev) => ({
      ...prev,
      page: 0,
      orderBy: "createdAt",
      direction: prev.direction === "ASC" ? "DESC" : "ASC",
    }));
  };

  const handleLimitChange = (nextLimit: number) => {
    setQuery((prev) => ({
      ...prev,
      page: 0,
      limit: nextLimit,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setActionFilter("");
    setFromDate("");
    setToDate("");
    setQuery({
      page: 0,
      limit: DEFAULT_LIMIT,
      orderBy: "createdAt",
      direction: "DESC",
      search: "",
      filters: {},
    });
  };

  const handlePageChange = (nextPage: number) => {
    setQuery((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const { data, isLoading, isError, isFetching, refetch } = useAdminAuditLogs(query);

  const logs = data?.items ?? [];
  const currentPage = data?.page ?? query.page ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const currentLimit = query.limit ?? DEFAULT_LIMIT;
  const currentDirection = query.direction ?? "DESC";

  const hasActiveFilters = Boolean(
    searchInput.trim() || actionFilter || fromDate || toDate
  );

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminPageHeader
          title="Audit Logs"
          subtitle="Track administrative changes across chip plans, daily rewards, and platform entities."
        />
        <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Unable to load audit logs"
            message="There was a problem fetching audit log records from the server."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <AdminPageHeader
        title="Audit Logs"
        subtitle="Track administrative changes across chip plans, daily rewards, and platform entities."
        action={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        }
      />

      <AuditFilterBar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        actionFilter={actionFilter}
        onActionChange={handleActionChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        direction={currentDirection}
        onToggleDirection={handleToggleDirection}
        limit={currentLimit}
        onLimitChange={handleLimitChange}
        totalElements={totalElements}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isLoading ? (
        <AuditLogsSkeleton />
      ) : logs.length === 0 ? (
        <div className="flex min-h-[24rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-100">
            No audit logs found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            {hasActiveFilters
              ? "Try adjusting or clearing your active search, action, or date filters."
              : "Administrative actions will appear here as plans and rewards are modified."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          <AuditLogsTable
            logs={logs}
            onInspect={(log) => setSelectedLog(log)}
          />

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-neutral-800/90 bg-neutral-900/75 px-4 py-3 text-xs text-neutral-400 sm:flex-row">
            <div>
              Showing{" "}
              <span className="font-mono font-semibold text-slate-200">
                {logs.length}
              </span>{" "}
              of{" "}
              <span className="font-mono font-semibold text-slate-200">
                {totalElements}
              </span>{" "}
              entries • Page{" "}
              <span className="font-mono font-semibold text-slate-200">
                {totalPages > 0 ? currentPage + 1 : 0}
              </span>{" "}
              of{" "}
              <span className="font-mono font-semibold text-slate-200">
                {totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={!(data?.hasPrevious ?? currentPage > 0) || isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  !(data?.hasNext ?? currentPage + 1 < totalPages) || isFetching
                }
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <AuditLogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}