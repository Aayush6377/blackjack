import { useEffect, useState } from "react";
import { Flame, Gift, Loader2, Sparkles, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useClaimDailyReward, useDailyRewardStatus } from "../../hooks/useRewards";

function getSeenStorageKey(loginSessionId: string, dateKey: string): string {
  return `bjr_daily_reward_seen:${loginSessionId}:${dateKey}`;
}

export function DailyRewardReminderModal() {
  const { user, isAuthenticated, loginSessionId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const isAlreadyOnRewardsPage = location.pathname.startsWith("/rewards/daily");

  const shouldCheckStatus = Boolean(
    isAuthenticated && !isAdmin && loginSessionId
  );

  const { data: status, isSuccess } = useDailyRewardStatus({
    enabled: shouldCheckStatus,
  });

  const claimMutation = useClaimDailyReward();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!shouldCheckStatus || !isSuccess || !status || !loginSessionId) {
      setIsOpen(false);
      return;
    }

    const storageKey = getSeenStorageKey(loginSessionId, status.today);
    const alreadyHandledThisLogin = sessionStorage.getItem(storageKey) === "1";

    if (status.claimedToday || isAlreadyOnRewardsPage) {
      sessionStorage.setItem(storageKey, "1");
      setIsOpen(false);
      return;
    }

    if (!alreadyHandledThisLogin) {
      setIsOpen(true);
    }
  }, [shouldCheckStatus, isSuccess, status, loginSessionId, isAlreadyOnRewardsPage]);

  const markSeenForThisLogin = () => {
    if (loginSessionId && status?.today) {
      sessionStorage.setItem(getSeenStorageKey(loginSessionId, status.today), "1");
    }
    setIsOpen(false);
  };

  const handleClaimNow = async () => {
    try {
      const claimed = await claimMutation.mutateAsync();
      toast.success(
        `Claimed Day ${claimed.dayNumber} reward (+${claimed.chipsCredited.toLocaleString("en-IN")} Chips)!`
      );
      markSeenForThisLogin();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to claim right now.";
      toast.error(msg);
      markSeenForThisLogin();
      navigate("/rewards/daily");
    }
  };

  const handleOpenRewardsPage = () => {
    markSeenForThisLogin();
    navigate("/rewards/daily");
  };

  if (!isOpen || !status || status.claimedToday) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-reward-reminder-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-400/35 bg-zinc-950 p-6 text-zinc-100 shadow-2xl shadow-amber-950/30">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-amber-500/15 via-emerald-500/10 to-transparent"
        />

        <button
          type="button"
          onClick={markSeenForThisLogin}
          disabled={claimMutation.isPending}
          aria-label="Dismiss reminder"
          className="relative z-10 float-right cursor-pointer rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/15 text-amber-300">
            <Gift className="h-6 w-6" />
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>
              Day {status.nextRewardDay} Streak Bonus Ready
            </span>
          </div>

          <h2
            id="daily-reward-reminder-title"
            className="mt-3 text-xl font-bold tracking-tight text-white"
          >
            Claim Today&apos;s Daily Reward!
          </h2>

          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Your daily bonus chips are waiting. Claim{" "}
            <span className="font-mono font-bold text-amber-300">
              +{status.nextChipsReward.toLocaleString("en-IN")} Chips
            </span>{" "}
            today to keep your{" "}
            <span className="font-semibold text-white">
              {status.currentStreakDay}-day
            </span>{" "}
            streak alive.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleClaimNow()}
              disabled={claimMutation.isPending}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claimMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Claim +{status.nextChipsReward.toLocaleString("en-IN")} Chips
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenRewardsPage}
              disabled={claimMutation.isPending}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              View Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}