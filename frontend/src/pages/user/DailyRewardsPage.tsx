import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ClaimHistoryCard } from "../../components/rewards/ClaimHistoryCard";
import { StreakHeroCard } from "../../components/rewards/StreakHeroCard";
import { StreakScheduleGrid } from "../../components/rewards/StreakScheduleGrid";
import { useClaimDailyReward, useDailyRewardStatus } from "../../hooks/useRewards";

export default function DailyRewardsPage() {
  const navigate = useNavigate();
  const [claimError, setClaimError] = useState<string | null>(null);

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDailyRewardStatus();

  const claimMutation = useClaimDailyReward();

  const handleClaim = async () => {
    setClaimError(null);
    try {
      const claimed = await claimMutation.mutateAsync();
      toast.success(
        `Claimed Day ${claimed.dayNumber} reward (+${claimed.chipsCredited.toLocaleString("en-IN")} Chips)!`
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to claim daily reward right now.";
      setClaimError(message);
      toast.error(message);
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.14),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Bar */}
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
              <span>Blackjack Royale · Daily Bonus</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
              Daily Rewards
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Build a daily streak, collect bonus chips, and review your past claims.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:border-amber-400/40 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {claimError && (
          <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs text-rose-200">
            <span>{claimError}</span>
            <button
              type="button"
              onClick={() => setClaimError(null)}
              className="cursor-pointer font-semibold text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-52 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/60" />
            <div className="h-64 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50" />
          </div>
        ) : isError || !status ? (
          <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-8 text-center">
            <p className="text-sm text-rose-200">
              {error?.message || "Unable to load daily reward status right now."}
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
            <StreakHeroCard
              status={status}
              isClaiming={claimMutation.isPending}
              onClaim={() => void handleClaim()}
            />

            <StreakScheduleGrid
              schedule={status.schedule}
              currentStreakDay={status.currentStreakDay}
              nextRewardDay={status.nextRewardDay}
              claimedToday={status.claimedToday}
            />

            <ClaimHistoryCard claims={status.recentClaims} />
          </>
        )}
      </div>
    </section>
  );
}