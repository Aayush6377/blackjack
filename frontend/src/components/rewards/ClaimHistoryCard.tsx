import { Calendar, CheckCircle2, History } from "lucide-react";
import { ChipAmount } from "../ui/ChipAmount";
import type { DailyRewardClaimResponse } from "../../types/reward";

interface ClaimHistoryCardProps {
  claims: DailyRewardClaimResponse[];
}

function formatClaimedTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClaimHistoryCard({ claims }: ClaimHistoryCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Recent Reward Claims</h3>
            <p className="text-xs text-zinc-400">
              Your claimed daily bonuses and streak day history.
            </p>
          </div>
        </div>

        <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300">
          {claims.length} {claims.length === 1 ? "Claim" : "Claims"}
        </span>
      </div>

      {claims.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-400">
          No daily rewards claimed yet. Claim today&apos;s reward above to start your streak!
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-900/50">
          {claims.map((claim) => (
            <div
              key={claim.claimId}
              className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      Day {claim.dayNumber} Reward
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700/80 bg-zinc-800/80 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                      <Calendar className="h-3 w-3 text-amber-400" />
                      {claim.rewardDate}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Claimed at {formatClaimedTimestamp(claim.claimedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-300">
                  
                    <ChipAmount
                      amount={claim.chipsCredited}
                      suffix=""
                      iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
                      showPlus={true}
                    />
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Bal: {claim.walletBalanceAfter.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}