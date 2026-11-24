import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  History,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BlackjackErrorState } from "../ui/BlackjackErrorState";
import { ChipTransactionsSkeleton } from "./ChipTransactionsSkeleton";
import type { ChipTransaction, TransactionType } from "../../types/wallet";
import type { PageResponse } from "../../types/page";

interface ChipTransactionsSectionProps {
  data: PageResponse<ChipTransaction> | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  onPageChange: (nextPage: number) => void;
}

const TRANSACTION_LABELS: Record<
  TransactionType,
  { label: string; isCredit: boolean; badgeClass: string }
> = {
  BET_PLACED: {
    label: "Bet Placed",
    isCredit: false,
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  INSURANCE_PLACED: {
    label: "Insurance",
    isCredit: false,
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  ADDITIONAL_BET: {
    label: "Double / Split Bet",
    isCredit: false,
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  WIN_PAYOUT: {
    label: "Hand Payout",
    isCredit: true,
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  PUSH_REFUND: {
    label: "Push Refund",
    isCredit: true,
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  SURRENDER_REFUND: {
    label: "Surrender Refund",
    isCredit: true,
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  CHIP_PURCHASE: {
    label: "Chip Purchase",
    isCredit: true,
    badgeClass: "border-amber-400/35 bg-amber-500/15 text-amber-300",
  },
  REWARD_CLAIM: {
    label: "Daily Reward",
    isCredit: true,
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  COUPON_REWARD: {
    label: "Coupon Redeemed",
    isCredit: true,
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  },
  ADMIN_ADJUSTMENT: {
    label: "Admin Adjustment",
    isCredit: true,
    badgeClass: "border-zinc-700 bg-zinc-800 text-zinc-200",
  },
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChipTransactionsSection({
  data,
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  onPageChange,
}: ChipTransactionsSectionProps) {
  const navigate = useNavigate();

  if (isLoading && !data) {
    return <ChipTransactionsSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/75 p-6">
        <BlackjackErrorState
          title="Unable to load chip transactions"
          message={error?.message || "Failed to fetch your chip ledger."}
          onRetry={onRetry}
        />
      </div>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/80">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white sm:text-base">
            Chip Ledger &amp; Activity
          </h2>
          {isFetching && (
            <span className="text-[11px] font-medium text-amber-300">
              Updating...
            </span>
          )}
        </div>

        <span className="text-xs text-zinc-400">
          {data?.totalElements ?? 0}{" "}
          {(data?.totalElements ?? 0) === 1 ? "entry" : "entries"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[16rem] flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400">
            <History className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white">
            No chip transactions yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-zinc-400">
            Your bets, payouts, daily rewards, coupon redemptions, and chip purchases will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800/90 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Balance After</th>
                  <th className="px-5 py-3">Round</th>
                  <th className="px-5 py-3 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {items.map((tx) => {
                  const meta = TRANSACTION_LABELS[tx.type] ?? {
                    label: tx.type,
                    isCredit: tx.amount >= 0,
                    badgeClass: "border-zinc-700 bg-zinc-800 text-zinc-200",
                  };

                  // Handle signed or unsigned backend amounts cleanly
                  const isPositive =
                    tx.type === "ADMIN_ADJUSTMENT"
                      ? tx.amount >= 0
                      : meta.isCredit && tx.amount >= 0;
                  const displayMagnitude = Math.abs(tx.amount).toLocaleString("en-IN");

                  return (
                    <tr
                      key={tx.id}
                      className="transition hover:bg-zinc-800/35"
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs font-bold">
                        <span
                          className={
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }
                        >
                          {isPositive ? "+" : "-"}
                          {displayMagnitude} Chips
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-zinc-200">
                        {tx.balanceAfter.toLocaleString("en-IN")} Chips
                      </td>

                      <td className="px-5 py-3.5 text-xs">
                        {tx.roundId ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/replays/${tx.roundId}`)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 transition hover:border-amber-400/55 hover:bg-amber-500/20"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>View Replay</span>
                          </button>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right text-xs text-zinc-400">
                        {formatDateTime(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {data && data.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/50 px-5 py-3.5 text-xs text-zinc-400 sm:flex-row">
              <div>
                Page{" "}
                <span className="font-semibold text-white">
                  {data.page + 1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {data.totalPages}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!data.hasPrevious || isFetching}
                  onClick={() => onPageChange(Math.max(0, data.page - 1))}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={!data.hasNext || isFetching}
                  onClick={() => onPageChange(data.page + 1)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}