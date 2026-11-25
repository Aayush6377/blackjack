import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { AdjustUserChipsModal } from "../../components/admin/users/AdjustUserChipsModal";
import { AdminUserDetailSkeleton } from "../../components/admin/users/AdminUserDetailSkeleton";
import { AdminUserProfileCard } from "../../components/admin/users/AdminUserProfileCard";
import { AdminUserPurchasesTable } from "../../components/admin/users/AdminUserPurchasesTable";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import {
  useAdminUserDetail,
  useAdminUserPurchases,
  useUpdateUserEnabled,
} from "../../hooks/useAdminUsers";
import type { AdminUserSummary } from "../../types/adminUser";

const DEFAULT_PURCHASES_LIMIT = 10;

export default function AdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_PURCHASES_LIMIT);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const {
    data: userDetail,
    isLoading: isLoadingUser,
    isError: isUserError,
    error: userError,
    refetch: refetchUser,
    isFetching: isFetchingUser,
  } = useAdminUserDetail(userId);

  const {
    data: purchasesPage,
    isLoading: isLoadingPurchases,
    isError: isPurchasesError,
    error: purchasesError,
    refetch: refetchPurchases,
    isFetching: isFetchingPurchases,
  } = useAdminUserPurchases(userId, { page, limit });

  const toggleEnabledMutation = useUpdateUserEnabled();

  const handleToggleEnabled = async () => {
    if (!userDetail) return;
    const nextEnabled = !userDetail.enabled;

    try {
      await toggleEnabledMutation.mutateAsync({
        userId: userDetail.id,
        enabled: nextEnabled,
      });
      toast.success(
        `${userDetail.name || userDetail.email} has been ${
          nextEnabled ? "enabled" : "disabled"
        }.`
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update account status.";
      toast.error(msg);
    }
  };

  const handleRefreshAll = () => {
    void refetchUser();
    void refetchPurchases();
  };

  const modalTargetUser: AdminUserSummary | null =
    isAdjustModalOpen && userDetail
      ? {
          id: userDetail.id,
          name: userDetail.name,
          email: userDetail.email,
          profileImageUrl: userDetail.profileImageUrl,
          enabled: userDetail.enabled,
          emailVerified: userDetail.emailVerified,
          walletBalance: userDetail.walletBalance,
          createdAt: userDetail.createdAt,
        }
      : null;

  const isAnyFetching =
    isFetchingUser || isFetchingPurchases || toggleEnabledMutation.isPending;

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <AdminPageHeader
        title={userDetail?.name || "User Details"}
        subtitle="Inspect player account profile, wallet balance, and purchase history before issuing chip adjustments."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-amber-400/40 hover:bg-neutral-800"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" />
              <span>Back to Users</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isAnyFetching}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                className={`h-4 w-4 ${isAnyFetching ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {isLoadingUser && !userDetail ? (
        <AdminUserDetailSkeleton />
      ) : isUserError || !userDetail ? (
        <div className="flex min-h-[55vh] w-full flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Unable to load user details"
            message={
              userError instanceof Error
                ? userError.message
                : "There was a problem loading this player's profile."
            }
            onRetry={() => void refetchUser()}
          />
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          <AdminUserProfileCard
            user={userDetail}
            isTogglingStatus={toggleEnabledMutation.isPending}
            onToggleEnabled={() => void handleToggleEnabled()}
            onOpenAddChips={() => setIsAdjustModalOpen(true)}
          />

          {isLoadingPurchases && !purchasesPage ? (
            <div className="h-64 animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/60" />
          ) : isPurchasesError || !purchasesPage ? (
            <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-6 text-center">
              <p className="text-sm text-rose-200">
                {purchasesError instanceof Error
                  ? purchasesError.message
                  : "Unable to load this user's purchase history."}
              </p>
              <button
                type="button"
                onClick={() => void refetchPurchases()}
                className="mt-3 cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
              >
                Retry Purchases
              </button>
            </div>
          ) : (
            <AdminUserPurchasesTable
              purchasesPage={purchasesPage}
              limit={limit}
              isFetching={isFetchingPurchases}
              onPageChange={setPage}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                setPage(0);
              }}
            />
          )}
        </div>
      )}

      <AdjustUserChipsModal
        user={modalTargetUser}
        onClose={() => setIsAdjustModalOpen(false)}
      />
    </div>
  );
}