import { CalendarCheck, Flame, Gift, Lock } from "lucide-react";
import { motion } from "motion/react";
import { ChipAmount } from "../ui/ChipAmount";
import type { DailyRewardStatusResponse } from "../../types/reward";

interface StreakHeroCardProps {
  status: DailyRewardStatusResponse;
  isClaiming: boolean;
  onClaim: () => void;
}

export function StreakHeroCard({
  status,
  isClaiming,
  onClaim,
}: StreakHeroCardProps) {
  const hasActiveSchedule = status.schedule.some((item) => item.active);
  const canClaim = !status.claimedToday && hasActiveSchedule && !isClaiming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-gradient-to-br from-emerald-950/65 via-zinc-900/95 to-zinc-950 p-6 shadow-2xl shadow-black/70 sm:p-8"
    >
      {/* Ambient Velvet & Gold Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none -right-20 -top-20 absolute h-64 w-64 rounded-full bg-amber-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none -bottom-24 -left-16 absolute h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl"
      />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              {status.currentStreakDay > 0
                ? `Active Streak · Day ${status.currentStreakDay}`
                : "Fresh Streak Ready"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-300">
              <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
              Cycle Day {status.nextRewardDay} of {status.totalConfiguredDays || 1}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {status.claimedToday
                ? "Today's Daily Reward Claimed"
                : `Claim Day ${status.nextRewardDay} Reward`}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-300">
              Claim once every day to climb the streak ladder. Missing a day resets your
              progress to <span className="font-semibold text-amber-300">Day 1</span>,
              and completing the full cycle wraps right back to Day 1.
            </p>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 rounded-2xl border border-amber-400/20 bg-zinc-950/70 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {status.claimedToday ? "Last Reward" : "Available Today"}
            </span>
            <div className="flex items-center gap-1.5 text-2xl font-extrabold text-amber-300">
              <ChipAmount
                amount={status.nextChipsReward}
                iconClassName="h-5 w-5 shrink-0 text-amber-400"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:items-end">
          <button
            type="button"
            disabled={!canClaim}
            onClick={onClaim}
            className={`inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-bold tracking-wide transition active:scale-[0.99] disabled:cursor-not-allowed ${
              status.claimedToday
                ? "border border-emerald-500/35 bg-emerald-950/50 text-emerald-300"
                : !hasActiveSchedule
                  ? "border border-zinc-700 bg-zinc-800/80 text-zinc-400"
                  : "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-zinc-950 shadow-xl shadow-amber-500/20 hover:brightness-105"
            }`}
          >
            {status.claimedToday ? (
              <>
                <CalendarCheck className="h-4 w-4" />
                <span>Claimed for {status.today}</span>
              </>
            ) : !hasActiveSchedule ? (
              <>
                <Lock className="h-4 w-4" />
                <span>No Active Rewards</span>
              </>
            ) : (
              <>
                <Gift className="h-4 w-4" />
                <span>{isClaiming ? "Crediting Chips..." : "Claim Daily Reward"}</span>
              </>
            )}
          </button>

          <span className="text-center text-[11px] text-zinc-400 sm:text-right">
            {status.claimedToday
              ? "Come back tomorrow to continue your streak"
              : "Instantly credited to your Chip Wallet"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}