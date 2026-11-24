import { Coins, Gift, PlusCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WalletBalanceCardProps {
  walletBalance: number | null;
  isWalletLoading: boolean;
  onRefreshWallet: () => Promise<number | null>;
}

export function WalletBalanceCard({
  walletBalance,
  isWalletLoading,
  onRefreshWallet,
}: WalletBalanceCardProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/45 via-zinc-900/95 to-zinc-950 p-5 shadow-lg shadow-emerald-950/20 sm:p-6">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>Available Bankroll</span>
          </span>

          <button
            type="button"
            onClick={() => void onRefreshWallet()}
            disabled={isWalletLoading}
            title="Sync wallet balance"
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${isWalletLoading ? "animate-spin text-amber-400" : ""}`}
            />
            <span>Sync</span>
          </button>
        </div>

        <div className="mt-4">
          {isWalletLoading && walletBalance === null ? (
            <div className="h-10 w-44 animate-pulse rounded-xl bg-zinc-800" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {(walletBalance ?? 0).toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-amber-400">
                Chips
              </span>
            </div>
          )}
          <p className="mt-1.5 text-xs text-zinc-400">
            Ready to wager across all unlocked Blackjack Royale tables.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/plans")}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/15 transition hover:bg-amber-300 sm:flex-none"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Buy Chips</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/rewards/daily")}
          className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-200 transition hover:border-emerald-400/60 hover:bg-emerald-500/25 sm:flex-none"
        >
          <Gift className="h-4 w-4 text-emerald-400" />
          <span>Daily Reward</span>
        </button>
      </div>
    </div>
  );
}