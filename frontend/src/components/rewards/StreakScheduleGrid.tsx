import { Check, Coins, Moon, Sparkles } from "lucide-react";
import { ChipAmount } from "../ui/ChipAmount";
import type { RewardConfigResponse } from "../../types/reward";

interface StreakScheduleGridProps {
  schedule: RewardConfigResponse[];
  currentStreakDay: number;
  nextRewardDay: number;
  claimedToday: boolean;
}

export function StreakScheduleGrid({
  schedule,
  currentStreakDay,
  nextRewardDay,
  claimedToday,
}: StreakScheduleGridProps) {
  if (schedule.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
        <p className="text-sm font-medium text-zinc-300">
          No daily reward schedule has been configured yet.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Check back soon for daily chip bonuses.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Streak Reward Ladder</h3>
          <p className="text-xs text-zinc-400">
            Consecutive daily days from Day 1 to Day {schedule.length}.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Next / Active Target
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Completed in Streak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {schedule.map((item) => {
          const isCompletedInStreak =
            currentStreakDay > 0 &&
            (claimedToday
              ? item.dayNumber <= currentStreakDay
              : item.dayNumber < nextRewardDay && item.dayNumber <= currentStreakDay);

          const isNextTarget = !claimedToday && item.dayNumber === nextRewardDay && item.active;
          const isClaimedTodayCard = claimedToday && item.dayNumber === currentStreakDay;

          return (
            <div
              key={item.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-3.5 transition ${
                !item.active
                  ? "border-zinc-800/70 bg-zinc-900/35 opacity-60"
                  : isNextTarget
                    ? "border-amber-400/70 bg-gradient-to-b from-amber-500/15 to-zinc-900/95 shadow-lg shadow-amber-500/10"
                    : isClaimedTodayCard
                      ? "border-emerald-400/60 bg-emerald-950/35"
                      : isCompletedInStreak
                        ? "border-emerald-500/35 bg-emerald-950/20"
                        : "border-zinc-800 bg-zinc-900/65"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isNextTarget
                      ? "text-amber-300"
                      : isCompletedInStreak || isClaimedTodayCard
                        ? "text-emerald-300"
                        : "text-zinc-400"
                  }`}
                >
                  Day {item.dayNumber}
                </span>

                {!item.active ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                    <Moon className="h-2.5 w-2.5" />
                    Paused
                  </span>
                ) : isClaimedTodayCard ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                    <Check className="h-3 w-3" />
                  </span>
                ) : isNextTarget ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    <Sparkles className="h-2.5 w-2.5" />
                    Next
                  </span>
                ) : isCompletedInStreak ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  <Coins className="h-3.5 w-3.5 text-zinc-600" />
                )}
              </div>

              <div className="mt-3">
                <div className="text-base font-extrabold text-white">
                  <ChipAmount
                    amount={item.chipsReward}
                    suffix=""
                    iconClassName="h-4 w-4 shrink-0 text-amber-400"
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {!item.active
                    ? "Inactive day"
                    : isClaimedTodayCard
                      ? "Claimed today"
                      : isNextTarget
                        ? "Ready to claim"
                        : isCompletedInStreak
                          ? "Claimed"
                          : "Upcoming"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}