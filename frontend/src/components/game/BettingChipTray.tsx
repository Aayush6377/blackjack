import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { RoomRules } from "../../types/room";
import {
  buildVisualChipStack,
  generateRoomChips,
  type CasinoChipDenom,
} from "../../utils/chipGenerator";
import { soundEffects } from "../../utils/soundEffects";
import { ChipAmount } from "../ui/ChipAmount";
import { ChipTokenIcon } from "../ui/ChipTokenIcon";

interface BettingChipTrayProps {
  rules: RoomRules;
  stagedBet: number;
  lastBet?: number;
  maxAffordableBet?: number;
  isConnected: boolean;
  isSubmitting: boolean;
  onChangeStagedBet: (nextBet: number) => void;
  onDealRound: (betAmount: number) => void;
}

export function BettingChipTray({
  rules,
  stagedBet,
  lastBet = 0,
  maxAffordableBet,
  isConnected,
  isSubmitting,
  onChangeStagedBet,
  onDealRound,
}: BettingChipTrayProps) {
  const ceiling =
    typeof maxAffordableBet === "number"
      ? Math.min(rules.maxBet, Math.max(0, maxAffordableBet))
      : rules.maxBet;

  const chips = useMemo(
    () =>
      generateRoomChips(
        rules.minBet,
        rules.maxBet,
        ceiling > 0 ? ceiling : rules.maxBet
      ),
    [rules.minBet, rules.maxBet, ceiling]
  );

  const visualStack = useMemo(
    () => buildVisualChipStack(stagedBet, chips, 7),
    [stagedBet, chips]
  );

  const handleChipClick = (chip: CasinoChipDenom) => {
    const next = stagedBet + chip.value;
    if (next > ceiling) return;
    soundEffects.play("chip");
    onChangeStagedBet(next);
  };

  const handleRebet = () => {
    if (lastBet <= 0) return;
    const clamped = Math.min(lastBet, ceiling);
    if (clamped < rules.minBet) return;
    soundEffects.play("chip");
    onChangeStagedBet(clamped);
  };

  const handleClear = () => {
    if (stagedBet === 0) return;
    soundEffects.play("chip");
    onChangeStagedBet(0);
  };

  const isBetPlaced = stagedBet > 0;
  const isValidBet = stagedBet >= rules.minBet && stagedBet <= ceiling;

  return (
    <div className="rounded-2xl border border-amber-400/30 bg-zinc-950/90 p-3.5 sm:p-4 shadow-xl">
      {/* Wager Summary + Chip Stack */}
      <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/25 bg-emerald-950/45 px-3.5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-amber-300/50 bg-emerald-900/35">
            <AnimatePresence>
              {visualStack.map((chip, idx) => (
                <motion.div
                  key={`${chip.value}-${idx}`}
                  initial={{ opacity: 0, y: -18, scale: 0.75 }}
                  animate={{ opacity: 1, y: -idx * 2.5, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  style={{ zIndex: idx + 1 }}
                  className={`absolute flex h-9 w-9 items-center justify-center rounded-full border-2 bg-gradient-to-br text-[10px] font-extrabold shadow ${chip.ringClass} ${chip.faceClass}`}
                >
                  {chip.label}
                </motion.div>
              ))}
            </AnimatePresence>
            {visualStack.length === 0 && (
              <span className="text-[9px] font-bold uppercase text-amber-200/60">
                Bet
              </span>
            )}
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-200/75">
              Current Bet
            </div>
            <div className="text-xl font-bold text-amber-300">
              <ChipAmount amount={stagedBet} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
              <span>Min</span>
              <ChipAmount amount={rules.minBet} suffix="" iconClassName="h-2.5 w-2.5 shrink-0 text-amber-400" />
              <span>· Max</span>
              <ChipAmount amount={rules.maxBet} suffix="" iconClassName="h-2.5 w-2.5 shrink-0 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {lastBet > 0 && (
            <button
              type="button"
              onClick={handleRebet}
              disabled={lastBet < rules.minBet || isSubmitting}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200 hover:border-amber-400/50 disabled:opacity-40 cursor-pointer"
            >
              <span>Rebet</span>
              <ChipTokenIcon className="h-3 w-3 shrink-0 text-amber-400" />
              <span>{Math.min(lastBet, ceiling).toLocaleString("en-IN")}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClear}
            disabled={!isBetPlaced || isSubmitting}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-300 hover:border-rose-400/50 hover:text-rose-200 disabled:opacity-40 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Chips Row + Deal Button */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {chips.map((chip) => {
            const disabled = isSubmitting || stagedBet + chip.value > ceiling;
            return (
              <motion.button
                key={chip.value}
                type="button"
                whileHover={disabled ? undefined : { y: -3, scale: 1.05 }}
                whileTap={disabled ? undefined : { scale: 0.92 }}
                disabled={disabled}
                onClick={() => handleChipClick(chip)}
                className={`relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border-4 border-dashed bg-gradient-to-br shadow-md transition ${chip.ringClass} ${chip.faceClass} ${
                  disabled
                    ? "cursor-not-allowed opacity-35"
                    : "cursor-pointer hover:shadow-amber-400/20"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-extrabold ${chip.accentClass}`}
                >
                  {chip.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!isBetPlaced || !isValidBet || !isConnected || isSubmitting}
          onClick={() => onDealRound(stagedBet)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-950 shadow-lg shadow-amber-400/15 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:border disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none cursor-pointer"
        >
          {!isConnected ? (
            "Connecting Table..."
          ) : isSubmitting ? (
            "Dealing..."
          ) : !isBetPlaced ? (
            "Place Chips to Deal"
          ) : stagedBet < rules.minBet ? (
            <>
              <span>Min Bet is</span>
              <ChipAmount amount={rules.minBet} iconClassName="h-3.5 w-3.5 shrink-0 text-zinc-500" />
            </>
          ) : (
            <>
              <span>Deal Cards (</span>
              <ChipAmount amount={stagedBet} iconClassName="h-3.5 w-3.5 shrink-0 text-zinc-950" />
              <span>)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}