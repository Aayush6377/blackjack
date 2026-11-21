import {
  ArrowRight,
  Coins,
  CopyPlus,
  Hand,
  Layers,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { GameStateSnapshot, HandSnapshot, PlayerActionType } from "../../types/game";
import { ChipAmount } from "../ui/ChipAmount";

interface ActionControlsBarProps {
  snapshot: GameStateSnapshot;
  activeHand: HandSnapshot | null;
  isConnected: boolean;
  isSubmitting: boolean;
  isLeaving: boolean;
  onAction: (action: PlayerActionType, handId?: string) => void;
  onStartNextRound: () => void;
  onLeaveGame: (roundId: string) => void;
}

export function ActionControlsBar({
  snapshot,
  activeHand,
  isConnected,
  isSubmitting,
  onAction,
  onStartNextRound,
}: ActionControlsBarProps) {
  if (snapshot.roundStatus === "COMPLETED") {
    const netPositive = snapshot.netResult > 0;
    const netZero = snapshot.netResult === 0;

    const netCardStyle = netPositive
      ? "border-emerald-500/35 bg-emerald-950/35 text-emerald-300"
      : netZero
        ? "border-amber-400/35 bg-amber-950/30 text-amber-300"
        : "border-rose-500/35 bg-rose-950/35 text-rose-300";

    return (
      <div className="overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-zinc-950 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        {/* Top champagne hairline */}
        <div
          aria-hidden="true"
          className="mb-3.5 h-px w-full bg-gradient-to-r from-transparent via-amber-400/45 to-transparent"
        />

        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
                Round Settled
              </span>
              {snapshot.roundOutcome && (
                <span className="rounded-full border border-amber-400/35 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-200">
                  {snapshot.roundOutcome.replaceAll("_", " ")}
                </span>
              )}
            </div>

            <span className="font-mono text-[11px] text-zinc-500">
              #{snapshot.roundId.slice(0, 8)}
            </span>
          </div>

          {/* Chip Ledger Summary Grid */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/65 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Bet
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                <ChipAmount
                  amount={snapshot.totalBet}
                  suffix=""
                  iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
                />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                Payout
              </div>
              <div className="mt-1 text-sm font-bold text-emerald-300">
                <ChipAmount
                  amount={snapshot.totalPayout}
                  suffix=""
                  iconClassName="h-3.5 w-3.5 shrink-0 text-emerald-400"
                />
              </div>
            </div>

            <div className={`rounded-xl border px-3 py-2 ${netCardStyle}`}>
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider opacity-85">
                <span>Net Result</span>
                {netPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                ) : !netZero ? (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                ) : null}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 text-sm font-extrabold">
                <span>{netPositive ? "+" : netZero ? "" : "-"}</span>
                <ChipAmount
                  amount={Math.abs(snapshot.netResult)}
                  suffix=""
                  iconClassName={
                    netPositive
                      ? "h-3.5 w-3.5 shrink-0 text-emerald-400"
                      : netZero
                        ? "h-3.5 w-3.5 shrink-0 text-amber-400"
                        : "h-3.5 w-3.5 shrink-0 text-rose-400"
                  }
                />
              </div>
            </div>
          </div>

          {/* Primary Next Bet CTA */}
          <button
            type="button"
            onClick={onStartNextRound}
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 px-5 py-3 text-xs sm:text-sm font-extrabold tracking-wide text-zinc-950 shadow-lg shadow-amber-400/20 transition hover:brightness-105 active:scale-[0.99]"
          >
            <span>Place Next Bet</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  if (
    snapshot.roundStatus !== "IN_PROGRESS" ||
    !activeHand ||
    activeHand.status !== "ACTIVE" ||
    activeHand.handValue >= 21
  ) {
    return null;
  }

  const canActOnHand = activeHand.status === "ACTIVE" && activeHand.handValue < 21;
  const canDouble = canActOnHand && activeHand.cards.length === 2 && snapshot.hands.length === 1;
  const canSplit =
    canActOnHand &&
    activeHand.cards.length === 2 &&
    snapshot.hands.length < 4 &&
    activeHand.cards[0]?.slice(0, -1) === activeHand.cards[1]?.slice(0, -1);
  const canSurrender =
    canActOnHand && activeHand.cards.length === 2 && snapshot.hands.length === 1;

  const controls: Array<{
    action: PlayerActionType;
    label: string;
    enabled: boolean;
    variant: "primary" | "secondary" | "danger";
    icon: typeof Coins;
  }> = [
    { action: "HIT", label: "Hit", enabled: canActOnHand, variant: "primary", icon: CopyPlus },
    { action: "STAND", label: "Stand", enabled: canActOnHand, variant: "secondary", icon: Hand },
    { action: "DOUBLE_DOWN", label: "Double Down", enabled: canDouble, variant: "secondary", icon: Coins },
    { action: "SPLIT", label: "Split", enabled: canSplit, variant: "secondary", icon: Layers },
    { action: "SURRENDER", label: "Surrender", enabled: canSurrender, variant: "danger", icon: ShieldAlert },
  ];

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>
            Acting on{" "}
            <strong className="text-amber-300">Hand #{activeHand.handNumber}</strong>
          </span>
          <span className="rounded-md border border-zinc-700/80 bg-zinc-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            {activeHand.handValue}
          </span>
        </div>

        {!isConnected && (
          <span className="text-[11px] font-medium text-rose-300">
            Reconnecting table...
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {controls.map((btn) => {
          const Icon = btn.icon;
          const disabled = !btn.enabled || !isConnected || isSubmitting;
          const isPrimary = btn.variant === "primary";

          const styleClass = isPrimary
            ? "col-span-2 sm:col-span-1 bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/15 hover:bg-amber-300"
            : btn.variant === "danger"
              ? "border border-rose-500/35 bg-rose-950/35 text-rose-200 hover:border-rose-400/55 hover:bg-rose-900/45"
              : "border border-zinc-700/90 bg-zinc-900/90 text-slate-100 hover:border-amber-400/50 hover:text-amber-200";

          return (
            <button
              key={btn.action}
              type="button"
              disabled={disabled}
              onClick={() => onAction(btn.action, activeHand.handId)}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/60 disabled:text-zinc-600 disabled:shadow-none ${styleClass}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{isSubmitting ? "Processing..." : btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}