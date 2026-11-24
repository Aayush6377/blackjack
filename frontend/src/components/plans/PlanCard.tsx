import { Coins, Flame, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import type { ChipPlanResponse } from "../../types/plan";

interface PlanCardProps {
  plan: ChipPlanResponse;
  isProcessing: boolean;
  disabled: boolean;
  onSelectPlan: (plan: ChipPlanResponse) => void;
}

function formatInrFromPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

export function PlanCard({
  plan,
  isProcessing,
  disabled,
  onSelectPlan,
}: PlanCardProps) {
  const hasBonus = plan.bonusChips > 0;
  const isDiscounted =
    plan.onSale &&
    plan.salePriceInPaise !== null &&
    plan.effectivePriceInPaise < plan.priceInPaise;

  const discountPercent = isDiscounted
    ? Math.round(
        ((plan.priceInPaise - plan.effectivePriceInPaise) / plan.priceInPaise) *
          100
      )
    : 0;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 ${
        plan.onSale
          ? "border-amber-400/50 bg-gradient-to-b from-amber-500/[0.11] via-zinc-900/95 to-zinc-950 shadow-xl shadow-amber-500/10 hover:border-amber-300/80"
          : "border-zinc-800/90 bg-gradient-to-b from-zinc-900/95 via-zinc-900/85 to-zinc-950/95 shadow-lg shadow-black/40 hover:border-emerald-400/45"
      }`}
    >
      {/* Subtle Top Ambient Glow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition duration-300 group-hover:opacity-100 ${
          plan.onSale
            ? "bg-amber-400/20 opacity-80"
            : "bg-emerald-500/15 opacity-55"
        }`}
      />

      <div className="relative z-10">
        {/* Top Badges */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span>{plan.totalChips.toLocaleString("en-IN")} Total</span>
          </span>

          {plan.onSale ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/45 bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-300 shadow-sm shadow-amber-500/10">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>
                {plan.saleName?.trim()
                  ? plan.saleName
                  : discountPercent > 0
                  ? `${discountPercent}% OFF`
                  : "SALE"}
              </span>
            </span>
          ) : hasBonus ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Bonus Included</span>
            </span>
          ) : null}
        </div>

        {/* Title & Description */}
        <h2 className="text-lg font-bold tracking-tight text-white transition group-hover:text-amber-100">
          {plan.name}
        </h2>
        <p className="mt-1 min-h-[2.5rem] text-xs leading-relaxed text-zinc-400">
          {plan.description?.trim() ||
            "Instant chip deposit credited directly to your Blackjack Royale wallet."}
        </p>

        {/* Chip Breakdown Box */}
        <div className="mt-4 rounded-xl border border-zinc-800/90 bg-zinc-950/85 p-3.5 ring-1 ring-inset ring-white/[0.03]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Base Chips</span>
            <span className="font-mono font-semibold text-zinc-200 tabular-nums">
              {plan.chips.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Bonus Chips</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                hasBonus
                  ? "rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              +{plan.bonusChips.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/90 pt-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              You Receive
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-base font-extrabold text-amber-300 tabular-nums">
              <Coins className="h-4 w-4 text-amber-400" />
              <span>{plan.totalChips.toLocaleString("en-IN")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Price & CTA */}
      <div className="relative z-10 mt-5 pt-1">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white tabular-nums">
              {formatInrFromPaise(plan.effectivePriceInPaise)}
            </span>
            {isDiscounted && (
              <span className="text-xs font-medium text-zinc-500 line-through tabular-nums">
                {formatInrFromPaise(plan.priceInPaise)}
              </span>
            )}
          </div>
          {isDiscounted && discountPercent > 0 && (
            <span className="rounded-md bg-amber-400/10 px-1.5 py-0.5 text-[11px] font-bold text-amber-300">
              Save {discountPercent}%
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectPlan(plan)}
          className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 ${
            plan.onSale
              ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-950 shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-200"
              : "bg-gradient-to-r from-emerald-500 to-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-300"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Purchase Pack</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}