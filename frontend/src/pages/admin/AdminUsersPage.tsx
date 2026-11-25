import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { AdjustUserChipsModal } from "../../components/admin/users/AdjustUserChipsModal";
import { AdminUsersTable } from "../../components/admin/users/AdminUsersTable";
import { AdminUsersTableSkeleton } from "../../components/admin/users/AdminUsersTableSkeleton";
import {
  AdminUsersToolbar,
  type UserSortField,
  type UserStatusFilter,
} from "../../components/admin/users/AdminUsersToolbar";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useAdminUsers, useUpdateUserEnabled } from "../../hooks/useAdminUsers";
import type { AdminUserSummary } from "../../types/adminUser";
import type { PageQueryParams } from "../../types/page";

const DEFAULT_LIMIT = 10;

export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("ALL");
  const [selectedUserForChips, setSelectedUserForChips] =
    useState<AdminUserSummary | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const [query, setQuery] = useState<PageQueryParams>({
    page: 0,
    limit: DEFAULT_LIMIT,
    orderBy: "createdAt",
    direction: "DESC",
    search: "",
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

  const { data, isLoading, isError, isFetching, refetch } = useAdminUsers(query);
  const toggleStatusMutation = useUpdateUserEnabled();

  const handleToggleEnabled = async (targetUser: AdminUserSummary) => {
    const nextEnabled = !targetUser.enabled;
    setTogglingUserId(targetUser.id);
    try {
      await toggleStatusMutation.mutateAsync({
        userId: targetUser.id,
        enabled: nextEnabled,
      });
      toast.success(
        `${targetUser.name || targetUser.email} has been ${
          nextEnabled ? "enabled" : "disabled"
        }.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update user status.";
      toast.error(msg);
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("ALL");
    setQuery({
      page: 0,
      limit: DEFAULT_LIMIT,
      orderBy: "createdAt",
      direction: "DESC",
      search: "",
    });
  };

  const users = useMemo(() => {
    const items = data?.items ?? [];
    if (statusFilter === "ALL") return items;
    const wantEnabled = statusFilter === "ENABLED";
    return items.filter((u) => u.enabled === wantEnabled);
  }, [data?.items, statusFilter]);

  const currentPage = data?.page ?? query.page ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const currentLimit = query.limit ?? DEFAULT_LIMIT;
  const currentOrderBy = (query.orderBy as UserSortField) ?? "createdAt";
  const currentDirection = query.direction ?? "DESC";
  const hasActiveFilters = Boolean(searchInput.trim() || statusFilter !== "ALL");

  if (isError) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminPageHeader
          title="Users & Wallets"
          subtitle="Search player accounts, toggle access, inspect payment history, and credit chips."
        />
        <div className="flex min-h-[60vh] w-full flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Unable to load users"
            message="There was a problem fetching player accounts from the server."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <AdminPageHeader
        title="Users & Wallets"
        subtitle="Search player accounts, toggle access, inspect payment history, and credit chips."
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

      <AdminUsersToolbar
        search={searchInput}
        statusFilter={statusFilter}
        orderBy={currentOrderBy}
        direction={currentDirection}
        limit={currentLimit}
        totalElements={statusFilter === "ALL" ? totalElements : users.length}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchInput}
        onStatusFilterChange={(nextFilter) => {
          setStatusFilter(nextFilter);
          setQuery((prev) => ({ ...prev, page: 0 }));
        }}
        onOrderByChange={(nextField) =>
          setQuery((prev) => ({ ...prev, page: 0, orderBy: nextField }))
        }
        onToggleDirection={() =>
          setQuery((prev) => ({
            ...prev,
            page: 0,
            direction: prev.direction === "ASC" ? "DESC" : "ASC",
          }))
        }
        onLimitChange={(nextLimit) =>
          setQuery((prev) => ({ ...prev, page: 0, limit: nextLimit }))
        }
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <AdminUsersTableSkeleton />
      ) : users.length === 0 ? (
        <div className="flex min-h-[24rem] flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/50 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-100">
            No users found
          </h2>
          <p className="mt-1 max-w-sm text-xs text-neutral-400">
            {hasActiveFilters
              ? "Try adjusting or clearing your active search or status filters."
              : "Registered player accounts will appear here."}
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
          <AdminUsersTable
            users={users}
            togglingUserId={togglingUserId}
            onToggleEnabled={(u) => void handleToggleEnabled(u)}
            onOpenAddChips={(u) => setSelectedUserForChips(u)}
          />

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-neutral-800/90 bg-neutral-900/75 px-4 py-3 text-xs text-neutral-400 sm:flex-row">
            <div>
              Showing{" "}
              <span className="font-mono font-semibold text-slate-200">
                {users.length}
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
                onClick={() =>
                  setQuery((prev) => ({
                    ...prev,
                    page: Math.max(0, currentPage - 1),
                  }))
                }
                disabled={!(data?.hasPrevious ?? currentPage > 0) || isFetching}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setQuery((prev) => ({ ...prev, page: currentPage + 1 }))
                }
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

      <AdjustUserChipsModal
        user={selectedUserForChips}
        onClose={() => setSelectedUserForChips(null)}
      />
    </div>
  );
}