import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, X } from "lucide-react";
import type { BulkCreateRewardConfigRequest } from "../../../types/reward";

export interface BulkRewardModalProps {
  open: boolean;
  onClose: () => void;
  suggestedStartDay?: number;
  onBulkCreate: (payload: BulkCreateRewardConfigRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function BulkRewardModal({
  open,
  onClose,
  suggestedStartDay = 1,
  onBulkCreate,
  isSubmitting = false,
}: BulkRewardModalProps) {
  const prefersReducedMotion = useReducedMotion();

  const [mode, setMode] = useState<"progression" | "explicit">("progression");
  const [days, setDays] = useState("7");
  const [startDay, setStartDay] = useState("1");
  const [baseChipsReward, setBaseChipsReward] = useState("200");
  const [incrementPerDay, setIncrementPerDay] = useState("50");
  const [explicitRewardsText, setExplicitRewardsText] = useState(
    "100, 200, 300, 500, 750, 1000, 2000"
  );
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStartDay(String(suggestedStartDay));
  }, [open, suggestedStartDay]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedStartDay = Number(startDay || 1);
    if (!Number.isInteger(parsedStartDay) || parsedStartDay < 1) {
      setError("Start day must be a whole number of at least 1.");
      return;
    }

    if (mode === "explicit") {
      const parsedExplicit = explicitRewardsText
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((n) => !Number.isNaN(n));

      if (
        parsedExplicit.length === 0 ||
        parsedExplicit.some((n) => !Number.isInteger(n) || n < 1)
      ) {
        setError(
          "Provide comma-separated positive whole numbers for explicit rewards (e.g., 100, 200, 500)."
        );
        return;
      }

      try {
        await onBulkCreate({
          days: parsedExplicit.length,
          startDay: parsedStartDay,
          baseChipsReward: parsedExplicit[0],
          incrementPerDay: 0,
          explicitRewards: parsedExplicit,
          active,
        });
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to bulk create rewards."
        );
      }
      return;
    }

    const parsedDays = Number(days);
    const parsedBase = Number(baseChipsReward);
    const parsedIncrement = Number(incrementPerDay || 0);

    if (!Number.isInteger(parsedDays) || parsedDays < 1) {
      setError("Number of days must be at least 1.");
      return;
    }
    if (!Number.isInteger(parsedBase) || parsedBase < 1) {
      setError("Base chips reward must be at least 1.");
      return;
    }
    if (!Number.isInteger(parsedIncrement) || parsedIncrement < 0) {
      setError("Increment per day must be 0 or greater.");
      return;
    }

    try {
      await onBulkCreate({
        days: parsedDays,
        startDay: parsedStartDay,
        baseChipsReward: parsedBase,
        incrementPerDay: parsedIncrement,
        active,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk create rewards."
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-reward-modal-title"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !isSubmitting && onClose()}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 10 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2
                  id="bulk-reward-modal-title"
                  className="text-lg font-bold text-slate-100"
                >
                  Bulk Generate Reward Days
                </h2>
                <p className="text-xs text-neutral-400">
                  Create multiple daily streak rewards in a single batch.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3.5 py-2.5 text-xs font-medium text-rose-200"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Mode Switch */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-800 bg-neutral-950/75 p-1">
                <button
                  type="button"
                  onClick={() => setMode("progression")}
                  disabled={isSubmitting}
                  className={`cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition ${
                    mode === "progression"
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-400 hover:text-slate-200"
                  }`}
                >
                  Step Progression
                </button>
                <button
                  type="button"
                  onClick={() => setMode("explicit")}
                  disabled={isSubmitting}
                  className={`cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition ${
                    mode === "explicit"
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-400 hover:text-slate-200"
                  }`}
                >
                  Custom Day List
                </button>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  Start Day
                </label>
                <input
                  type="number"
                  min={1}
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none"
                />
              </div>

              {mode === "progression" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Days Count *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Base Chips *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={baseChipsReward}
                      onChange={(e) => setBaseChipsReward(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      + Chips / Day
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={incrementPerDay}
                      onChange={(e) => setIncrementPerDay(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Rewards per Day (comma-separated chips) *
                  </label>
                  <textarea
                    rows={3}
                    value={explicitRewardsText}
                    onChange={(e) => setExplicitRewardsText(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none"
                  />
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Enable created reward days
                  </div>
                  <div className="text-xs text-neutral-400">
                    Mark newly generated days as active immediately.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-400/40"
                />
              </label>

              <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Generate Days</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}