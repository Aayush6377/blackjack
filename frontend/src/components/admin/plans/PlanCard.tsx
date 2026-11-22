import { Coins, Pencil, Tag, Trash2 } from "lucide-react";
import type { ChipPlanResponse } from "../../../types/plan";

export interface PlanCardProps {
  plan: ChipPlanResponse;
  onEdit: (plan: ChipPlanResponse) => void;
  onDelete: (plan: ChipPlanResponse) => void;
  disabled?: boolean;
}

function formatRupeesFromPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function PlanCard({ plan, onEdit, onDelete, disabled = false }: PlanCardProps) {
  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-amber-500/20 bg-neutral-900/90 p-5 shadow-lg shadow-black/40 transition hover:border-amber-400/40">
      <div className="space-y-4">
        {/* Top Row: Name + Status Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-100">
              {plan.name}
            </h2>
            {plan.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                {plan.description}
              </p>
            )}
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
              plan.active
                ? "border-emerald-500/35 bg-emerald-950/60 text-emerald-300"
                : "border-neutral-700 bg-neutral-800/80 text-neutral-400"
            }`}
          >
            {plan.active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Chip Allocation Box */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/75 p-3.5">
          <div className="flex items-center gap-2 text-amber-300">
            <Coins className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="font-mono text-xl font-bold tabular-nums">
              {plan.totalChips.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-amber-300/75">
              Total Chips
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span>Base: {plan.chips.toLocaleString("en-IN")}</span>
            {plan.bonusChips > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/25 bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-200">
                +{plan.bonusChips.toLocaleString("en-IN")} bonus
              </span>
            )}
          </div>
        </div>

        {/* Sale Info if Configured */}
        {(plan.onSale || plan.salePriceInPaise != null || plan.saleName) && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-200">
              <Tag className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span>{plan.saleName || "Special Sale"}</span>
            </span>
            <span className="font-semibold text-amber-300">
              {plan.onSale ? "Live Now" : "Scheduled / Ended"}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Row: Price + Actions */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-800/90 pt-4">
        <div className="leading-tight">
          <div className="font-mono text-lg font-bold tabular-nums text-slate-100">
            {formatRupeesFromPaise(plan.effectivePriceInPaise)}
          </div>
          {plan.onSale && plan.effectivePriceInPaise !== plan.priceInPaise && (
            <div className="font-mono text-xs text-neutral-500 line-through">
              {formatRupeesFromPaise(plan.priceInPaise)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            disabled={disabled}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-400/40 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(plan)}
            disabled={disabled}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition hover:border-rose-500/40 hover:bg-rose-950/35 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}