import { CalendarDays, Coins, Pencil, Trash2 } from "lucide-react";
import type { RewardConfigResponse } from "../../../types/reward";

export interface RewardConfigCardProps {
  config: RewardConfigResponse;
  onEdit: (config: RewardConfigResponse) => void;
  onDelete: (config: RewardConfigResponse) => void;
  disabled?: boolean;
}

export function RewardConfigCard({
  config,
  onEdit,
  onDelete,
  disabled = false,
}: RewardConfigCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-amber-500/20 bg-neutral-900/90 p-5 shadow-lg shadow-black/40 transition hover:border-amber-400/40">
      <div className="space-y-4">
        {/* Top Row: Day Badge + Active Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
            <span>Day {config.dayNumber}</span>
          </span>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
              config.active
                ? "border-emerald-500/35 bg-emerald-950/60 text-emerald-300"
                : "border-neutral-700 bg-neutral-800/80 text-neutral-400"
            }`}
          >
            {config.active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Chip Reward Box */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/75 p-3.5">
          <div className="flex items-center gap-2 text-amber-300">
            <Coins className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="font-mono text-xl font-bold tabular-nums">
              +{config.chipsReward.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-amber-300/75">
              Chips
            </span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            Streak day {config.dayNumber} payout
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-neutral-800/90 pt-4">
        <button
          type="button"
          onClick={() => onEdit(config)}
          disabled={disabled}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-amber-400/40 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(config)}
          disabled={disabled}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-neutral-300 transition hover:border-rose-500/40 hover:bg-rose-950/35 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}