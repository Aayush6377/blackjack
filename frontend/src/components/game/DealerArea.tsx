import type { CardCode, InsuranceStatus, RoundStatus } from "../../types/game";
import { ChipAmount } from "../ui/ChipAmount";
import { PlayingCard } from "./PlayingCard";

interface DealerAreaProps {
  dealerCards: CardCode[];
  dealerTotal: number;
  roundStatus?: RoundStatus;
  insuranceAvailable?: boolean;
  insuranceStatus?: InsuranceStatus;
  originalBet?: number;
  previousCardCount?: number;
  isSubmitting?: boolean;
  onDecideInsurance?: (accept: boolean) => void;
}

export function DealerArea({
  dealerCards,
  dealerTotal,
  roundStatus,
  insuranceAvailable = false,
  insuranceStatus = "NONE",
  originalBet = 0,
  previousCardCount = 0,
  isSubmitting = false,
  onDecideInsurance,
}: DealerAreaProps) {
  const isRoundCompleted = roundStatus === "COMPLETED";
  const hideHoleCard =
    roundStatus === "IN_PROGRESS" && !isRoundCompleted && dealerCards.length >= 2;

  const insuranceWager = Math.floor(originalBet / 2);

  return (
    <section className="flex flex-col items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-950/35 px-4 py-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-200/80">
          Dealer Hand
        </span>
        {dealerCards.length > 0 && (
          <span className="rounded-full border border-amber-400/30 bg-zinc-950/80 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
            {isRoundCompleted
              ? `Total: ${dealerTotal}`
              : hideHoleCard
                ? `Showing ${dealerCards[0]}`
                : `Total: ${dealerTotal}`}
          </span>
        )}
      </div>

      {/* Cards Row */}
      {dealerCards.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-emerald-400/25 px-6 text-xs text-emerald-200/60 sm:h-32">
          Waiting for deal...
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {dealerCards.map((code, index) => {
            const isHoleCard = hideHoleCard && index === 1;
            const isNewlyDealt = index >= previousCardCount;

            return (
              <PlayingCard
                key={`${code}-${index}`}
                cardCode={code}
                faceDown={isHoleCard}
                dealIndex={index}
                playDealSound={isNewlyDealt}
              />
            );
          })}
        </div>
      )}

      {/* Insurance Decision Prompt */}
      {insuranceAvailable && insuranceStatus === "NONE" && onDecideInsurance && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-amber-400/45 bg-zinc-950/90 px-4 py-2.5 text-xs shadow-lg">
          <span className="inline-flex flex-wrap items-center gap-1 font-medium text-amber-200">
            <span>Dealer shows Ace — Take Insurance for</span>
            <ChipAmount
              amount={insuranceWager}
              className="font-bold text-amber-300"
            />
            <span>?</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onDecideInsurance(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1 font-bold text-zinc-950 hover:bg-amber-300 disabled:opacity-50 cursor-pointer"
            >
              <span>Yes (</span>
              <ChipAmount
                amount={insuranceWager}
                suffix=""
                iconClassName="h-3 w-3 shrink-0 text-zinc-950"
              />
              <span>)</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onDecideInsurance(false)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 font-semibold text-zinc-200 hover:border-zinc-500 disabled:opacity-50 cursor-pointer"
            >
              No Thanks
            </button>
          </div>
        </div>
      )}
    </section>
  );
}