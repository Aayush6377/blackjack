import { Sparkles } from "lucide-react";
import { PlayingCardSprite } from "./PlayingCardSprite";

export function CardValuesShowcase() {
  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/30 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            Step 01 · Objective &amp; Card Math
          </div>
          <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
            Get Closer to 21 Than the Dealer — Without Busting
          </h2>
        </div>
        <Sparkles className="hidden h-5 w-5 text-amber-400 sm:block" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Aces */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/75 p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-amber-300">Aces (11 or 1)</h3>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
                Soft / Hard
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              Counts as <strong className="text-slate-200">11</strong> unless
              that would push your hand over 21, in which case it automatically
              drops to <strong className="text-slate-200">1</strong>.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 pt-2">
            <PlayingCardSprite code="AS" tiltDeg={-5} caption="Ace = 11" />
            <PlayingCardSprite code="6H" tiltDeg={4} caption="Total = 17" />
          </div>
        </div>

        {/* Face Cards & 10s */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/75 p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-amber-300">
                10, J, Q, K = 10
              </h3>
              <span className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 font-mono text-[11px] text-neutral-300">
                Value 10
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              Tens and court cards each carry a value of{" "}
              <strong className="text-slate-200">10</strong>. Pairing an Ace with
              a 10-value card on the initial deal forms a{" "}
              <strong className="text-emerald-300">Natural Blackjack</strong>.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 pt-2">
            <PlayingCardSprite code="AD" tiltDeg={-5} caption="Ace" />
            <PlayingCardSprite code="KS" tiltDeg={4} caption="King = 10" />
          </div>
        </div>

        {/* Number Cards */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/75 p-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-amber-300">
                2 through 9 = Face Value
              </h3>
              <span className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 font-mono text-[11px] text-neutral-300">
                2 – 9
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
              Every pip card from <strong className="text-slate-200">2</strong>{" "}
              to <strong className="text-slate-200">9</strong> equals its printed
              number. Going past <strong className="text-rose-300">21</strong>{" "}
              is a <strong className="text-rose-300">Bust</strong>.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 pt-2">
            <PlayingCardSprite code="2C" tiltDeg={-6} caption="2" />
            <PlayingCardSprite code="7D" tiltDeg={0} caption="7" />
            <PlayingCardSprite code="9S" tiltDeg={6} caption="9" />
          </div>
        </div>
      </div>
    </section>
  );
}