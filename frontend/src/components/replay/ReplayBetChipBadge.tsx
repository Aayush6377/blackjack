import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  buildVisualChipStack,
  generateRoomChips,
} from "../../utils/chipGenerator";
import { ChipAmount } from "../ui/ChipAmount";

interface ReplayBetChipBadgeProps {
  betAmount: number;
  minBet?: number;
  maxBet?: number;
  label?: string;
}

export function ReplayBetChipBadge({
  betAmount,
  minBet = 10,
  maxBet = 100000,
  label = "Hand Wager",
}: ReplayBetChipBadgeProps) {
  const chips = useMemo(() => {
    const safeMin = Math.max(1, minBet);
    const safeMax = Math.max(safeMin, maxBet, betAmount);
    return generateRoomChips(safeMin, safeMax, safeMax);
  }, [minBet, maxBet, betAmount]);

  const visualStack = useMemo(
    () => buildVisualChipStack(Math.max(0, betAmount), chips, 6),
    [betAmount, chips]
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-zinc-950/90 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-amber-300/45 bg-emerald-950/60">
          <AnimatePresence>
            {visualStack.map((chip, idx) => (
              <motion.div
                key={`${chip.value}-${idx}`}
                initial={{ opacity: 0, y: -12, scale: 0.8 }}
                animate={{ opacity: 1, y: -idx * 2.5, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
                style={{ zIndex: idx + 1 }}
                className={`absolute flex h-8 w-8 items-center justify-center rounded-full border-2 bg-gradient-to-br text-[9px] font-extrabold shadow ${chip.ringClass} ${chip.faceClass}`}
              >
                {chip.label}
              </motion.div>
            ))}
          </AnimatePresence>
          {visualStack.length === 0 && (
            <span className="text-[9px] font-bold uppercase text-amber-200/50">
              0
            </span>
          )}
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {label}
          </div>
          <div className="text-base font-extrabold text-amber-300">
            <ChipAmount
              amount={betAmount}
              suffix=""
              iconClassName="h-4 w-4 shrink-0 text-amber-400"
            />
          </div>
        </div>
      </div>

      <span className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
        {visualStack.length} {visualStack.length === 1 ? "chip" : "chips"}
      </span>
    </div>
  );
}