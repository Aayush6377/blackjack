import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, Trash2, X } from "lucide-react";
import type { BulkDeleteRewardConfigRequest } from "../../../types/reward";

export interface BulkDeleteRewardModalProps {
  open: boolean;
  onClose: () => void;
  maxDay?: number;
  onBulkDelete: (payload: BulkDeleteRewardConfigRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function BulkDeleteRewardModal({
  open,
  onClose,
  maxDay = 1,
  onBulkDelete,
  isSubmitting = false,
}: BulkDeleteRewardModalProps) {
  const prefersReducedMotion = useReducedMotion();

  const [mode, setMode] = useState<"range" | "explicit">("range");
  const [startDay, setStartDay] = useState("1");
  const [endDay, setEndDay] = useState("1");
  const [daysText, setDaysText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setStartDay("1");
    setEndDay(String(Math.max(1, maxDay)));
    setDaysText("");
  }, [open, maxDay]);

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

    if (mode === "explicit") {
      const parsedDays = daysText
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((n) => !Number.isNaN(n));

      if (
        parsedDays.length === 0 ||
        parsedDays.some((n) => !Number.isInteger(n) || n < 1)
      ) {
        setError(
          "Provide comma-separated positive day numbers (e.g., 3, 7, 14)."
        );
        return;
      }

      try {
        await onBulkDelete({
          dayNumbers: Array.from(new Set(parsedDays)),
        });
        onClose();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to bulk delete reward days."
        );
      }
      return;
    }

    const parsedStart = Number(startDay);
    const parsedEnd = Number(endDay);

    if (!Number.isInteger(parsedStart) || parsedStart < 1) {
      setError("Start day must be a whole number of at least 1.");
      return;
    }
    if (!Number.isInteger(parsedEnd) || parsedEnd < 1) {
      setError("End day must be a whole number of at least 1.");
      return;
    }
    if (parsedEnd < parsedStart) {
      setError("End day must be greater than or equal to start day.");
      return;
    }

    try {
      await onBulkDelete({
        startDay: parsedStart,
        endDay: parsedEnd,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to bulk delete reward days."
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
          aria-labelledby="bulk-delete-reward-modal-title"
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2
                  id="bulk-delete-reward-modal-title"
                  className="text-lg font-bold text-slate-100"
                >
                  Bulk Delete Reward Days
                </h2>
                <p className="text-xs text-neutral-400">
                  Remove a range of days or specific day numbers. Remaining days
                  will reindex consecutively.
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
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-800 bg-neutral-950/75 p-1">
                <button
                  type="button"
                  onClick={() => setMode("range")}
                  disabled={isSubmitting}
                  className={`cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition ${
                    mode === "range"
                      ? "bg-rose-600 text-white"
                      : "text-neutral-400 hover:text-slate-200"
                  }`}
                >
                  Day Range
                </button>
                <button
                  type="button"
                  onClick={() => setMode("explicit")}
                  disabled={isSubmitting}
                  className={`cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition ${
                    mode === "explicit"
                      ? "bg-rose-600 text-white"
                      : "text-neutral-400 hover:text-slate-200"
                  }`}
                >
                  Specific Days
                </button>
              </div>

              {mode === "range" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Start Day *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={startDay}
                      onChange={(e) => setStartDay(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-rose-400/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      End Day *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={endDay}
                      onChange={(e) => setEndDay(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-rose-400/70 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Day Numbers to Delete (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={daysText}
                    onChange={(e) => setDaysText(e.target.value)}
                    placeholder="3, 7, 14"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder:text-neutral-600 focus:border-rose-400/70 focus:outline-none"
                  />
                </div>
              )}

              <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 px-3.5 py-2.5 text-xs text-rose-200/90">
                This action cannot be undone and logs a single bulk-delete audit
                record.
              </div>

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
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Delete Days</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}