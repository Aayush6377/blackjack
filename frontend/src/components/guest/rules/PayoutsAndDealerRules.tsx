import { ShieldAlert, Trophy } from "lucide-react";
import { PlayingCardSprite } from "./PlayingCardSprite";

export function PayoutsAndDealerRules() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Payouts */}
      <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/30 sm:p-6 lg:col-span-7">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-800/80 pb-3.5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Step 03 · Settlement &amp; Payouts
            </div>
            <h2 className="mt-0.5 text-lg font-bold text-white">
              How Hands Are Settled
            </h2>
          </div>
          <Trophy className="h-5 w-5 text-amber-400" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3.5">
            <div>
              <div className="text-sm font-bold text-emerald-300">
                Natural Blackjack (3:2 or Room Rule)
              </div>
              <p className="text-xs text-neutral-300">
                First two cards total 21 (not from a split) and beat the dealer.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 font-mono text-xs font-bold text-emerald-200">
              3 : 2
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/75 p-3.5">
            <div>
              <div className="text-sm font-bold text-white">Standard Win</div>
              <p className="text-xs text-neutral-400">
                Your hand is &le; 21 and higher than the dealer&apos;s, or the
                dealer busts.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
              1 : 1
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/75 p-3.5">
            <div>
              <div className="text-sm font-bold text-slate-200">
                Push (Tie)
              </div>
              <p className="text-xs text-neutral-400">
                Player and dealer finish with the exact same total. Your stake
                is returned.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 font-mono text-xs font-bold text-neutral-300">
              REFUND
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/75 p-3.5">
            <div>
              <div className="text-sm font-bold text-rose-300">
                Bust or Dealer Wins
              </div>
              <p className="text-xs text-neutral-400">
                Hand exceeds 21 or dealer finishes with a higher valid total.
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-300">
              - STAKE
            </span>
          </div>
        </div>
      </section>

      {/* Dealer Rules */}
      <section className="flex flex-col justify-between rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/30 sm:p-6 lg:col-span-5">
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-neutral-800/80 pb-3.5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Step 04 · House Dealer
              </div>
              <h2 className="mt-0.5 text-lg font-bold text-white">
                Dealer Turn Rules
              </h2>
            </div>
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          </div>

          <p className="text-xs leading-relaxed text-neutral-300 sm:text-sm">
            The dealer plays automatically after all player hands finish. The
            dealer draws until reaching{" "}
            <strong className="text-white">17 or higher</strong>, following each
            room&apos;s rule on <strong className="text-amber-300">Soft 17</strong>{" "}
            (Ace + 6).
          </p>
        </div>

        <div className="my-5 flex items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/80 p-4">
          <PlayingCardSprite code="AH" tiltDeg={-4} caption="Ace" />
          <PlayingCardSprite code="6C" tiltDeg={4} caption="6 = Soft 17" />
        </div>

        <p className="text-xs text-neutral-400">
          Check the room header before sitting down: some tables make the
          dealer <strong className="text-slate-200">stand on all 17s</strong>,
          while others allow the dealer to{" "}
          <strong className="text-slate-200">hit Soft 17</strong>.
        </p>
      </section>
    </div>
  );
}