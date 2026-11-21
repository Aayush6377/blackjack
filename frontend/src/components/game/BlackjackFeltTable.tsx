import type {
  CardCode,
  HandSnapshot,
  InsuranceStatus,
  RoundStatus,
} from "../../types/game";
import type { RoomRules } from "../../types/room";
import { ChipAmount } from "../ui/ChipAmount";
import { DealerArea } from "./DealerArea";
import { DeckShuffleOverlay } from "./DeckShuffleOverlay";
import { PlayerHandsArea } from "./PlayerHandsArea";

interface BlackjackFeltTableProps {
  rules: RoomRules;
  dealerCards: CardCode[];
  dealerTotal: number;
  roundStatus?: RoundStatus;
  insuranceAvailable: boolean;
  insuranceStatus: InsuranceStatus;
  originalBet: number;
  hands: HandSnapshot[];
  selectedHandId: string | null;
  prevDealerCount: number;
  prevHandCardCounts: Record<string, number>;
  isShuffling: boolean;
  isSubmitting: boolean;
  onShuffleComplete: () => void;
  onManualShufflePreview: () => void;
  onDecideInsurance: (accept: boolean) => void;
  onSelectHand: (handId: string) => void;
}

export function BlackjackFeltTable({
  rules,
  dealerCards,
  dealerTotal,
  roundStatus,
  insuranceAvailable,
  insuranceStatus,
  originalBet,
  hands,
  selectedHandId,
  prevDealerCount,
  prevHandCardCounts,
  isShuffling,
  isSubmitting,
  onShuffleComplete,
  onManualShufflePreview,
  onDecideInsurance,
  onSelectHand,
}: BlackjackFeltTableProps) {
  return (
    <div className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.75rem] border-2 border-amber-400/40 bg-[radial-gradient(ellipse_at_top,_#15803d_0%,_#065f46_55%,_#022c22_100%)] p-3.5 shadow-[inset_0_0_55px_rgba(0,0,0,0.6),0_14px_35px_rgba(0,0,0,0.55)] sm:min-h-[380px] sm:p-5 lg:min-h-[500px] lg:rounded-[5.5rem] lg:border-4 lg:p-7">
      {/* Subtle Gold Felt Trim */}
      <div className="pointer-events-none absolute inset-2.5 rounded-[1.35rem] border border-amber-300/20 lg:inset-4 lg:rounded-[4.8rem]" />

      {/* Center Felt Rule Text */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 select-none text-center lg:block">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-amber-200/25">
          BLACKJACK PAYS {rules.blackjackPayout}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/20">
          {rules.dealerHitsSoft17 ? "DEALER HITS SOFT 17" : "DEALER STANDS ON ALL 17s"}
        </p>
      </div>

      {/* Top Row: Shoe + Dealer */}
      <div className="relative z-10 grid grid-cols-[76px_1fr] items-center gap-2.5 sm:grid-cols-[105px_1fr] sm:gap-4">
        <div className="flex justify-center">
          <DeckShuffleOverlay
            decksPerShoe={rules.decksPerShoe}
            isShuffling={isShuffling}
            onShuffleComplete={onShuffleComplete}
            onManualShufflePreview={onManualShufflePreview}
          />
        </div>

        <DealerArea
          dealerCards={dealerCards}
          dealerTotal={dealerTotal}
          roundStatus={roundStatus}
          insuranceAvailable={insuranceAvailable}
          insuranceStatus={insuranceStatus}
          originalBet={originalBet}
          previousCardCount={prevDealerCount}
          isSubmitting={isSubmitting}
          onDecideInsurance={onDecideInsurance}
        />
      </div>

      <div className="relative z-10 mt-3 sm:mt-5">
        {hands.length > 0 ? (
          <PlayerHandsArea
            hands={hands}
            selectedHandId={selectedHandId}
            previousCardCountsByHand={prevHandCardCounts}
            onSelectHand={onSelectHand}
          />
        ) : (
          <div className="mx-auto flex max-w-xs flex-col items-center justify-center rounded-xl border border-dashed border-amber-300/30 bg-black/25 px-3.5 py-2.5 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/80">
              Click Chips to Place Bet
            </span>
            <span className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-emerald-100/60">
              <span>Min</span>
              <ChipAmount amount={rules.minBet} suffix="" iconClassName="h-2.5 w-2.5 shrink-0 text-amber-400" />
              <span>· Max</span>
              <ChipAmount amount={rules.maxBet} suffix="" iconClassName="h-2.5 w-2.5 shrink-0 text-amber-400" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}