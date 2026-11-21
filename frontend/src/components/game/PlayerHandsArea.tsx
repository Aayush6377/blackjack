import type { HandSnapshot } from "../../types/game";
import { ChipAmount } from "../ui/ChipAmount";
import { PlayingCard } from "./PlayingCard";

interface PlayerHandsAreaProps {
  hands: HandSnapshot[];
  selectedHandId: string | null;
  previousCardCountsByHand: Record<string, number>;
  onSelectHand?: (handId: string) => void;
}

function outcomeBadgeStyle(outcome: HandSnapshot["outcome"]): string {
  switch (outcome) {
    case "BLACKJACK_WIN":
    case "WIN":
      return "border-emerald-400/50 bg-emerald-500/20 text-emerald-200";
    case "PUSH":
      return "border-amber-400/50 bg-amber-500/20 text-amber-200";
    case "LOSS":
    case "SURRENDER":
      return "border-rose-400/50 bg-rose-500/20 text-rose-200";
    default:
      return "border-zinc-700 bg-zinc-900 text-zinc-300";
  }
}

export function PlayerHandsArea({
  hands,
  selectedHandId,
  previousCardCountsByHand,
  onSelectHand,
}: PlayerHandsAreaProps) {
  if (hands.length === 0) {
    return null;
  }

  const isSplit = hands.length > 1;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
          {isSplit ? `Player Hands (${hands.length} Split)` : "Your Hand"}
        </span>
      </div>

      <div
        className={`grid gap-4 ${
          hands.length === 1
            ? "grid-cols-1 justify-items-center"
            : hands.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {hands.map((hand) => {
          const isActiveHand =
            hand.status === "ACTIVE" &&
            (selectedHandId ? selectedHandId === hand.handId : true);
          const prevCount = previousCardCountsByHand[hand.handId] ?? 0;

          return (
            <div
              key={hand.handId}
              onClick={() => {
                if (hand.status === "ACTIVE" && onSelectHand) {
                  onSelectHand(hand.handId);
                }
              }}
              className={`flex w-full max-w-md flex-col items-center rounded-2xl border p-4 transition backdrop-blur-sm ${
                isActiveHand
                  ? "border-amber-400/70 bg-zinc-950/80 shadow-lg shadow-amber-400/10"
                  : "border-zinc-800/80 bg-zinc-950/60"
              } ${hand.status === "ACTIVE" && isSplit ? "cursor-pointer" : ""}`}
            >
              {/* Hand Header */}
              <div className="mb-3 flex w-full flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {isSplit ? `Hand #${hand.handNumber}` : "Hand"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 font-semibold text-amber-300">
                    <span>Bet</span>
                    <ChipAmount
                      amount={hand.betAmount}
                      suffix=""
                      iconClassName="h-3 w-3 shrink-0 text-amber-400"
                    />
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-0.5 font-mono font-bold text-white">
                    {hand.handValue}
                  </span>

                  {hand.outcome ? (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${outcomeBadgeStyle(
                        hand.outcome
                      )}`}
                    >
                      {hand.outcome}
                    </span>
                  ) : (
                    <span className="rounded-full border border-zinc-700/80 bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-300">
                      {hand.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {hand.cards.map((code, idx) => (
                  <PlayingCard
                    key={`${hand.handId}-${code}-${idx}`}
                    cardCode={code}
                    dealIndex={idx}
                    playDealSound={idx >= prevCount}
                    compact={isSplit}
                    highlight={isActiveHand}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}