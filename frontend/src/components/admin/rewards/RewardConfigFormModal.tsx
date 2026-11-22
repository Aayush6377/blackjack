import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, X } from "lucide-react";
import type {
  CreateRewardConfigRequest,
  RewardConfigResponse,
  UpdateRewardConfigRequest,
} from "../../../types/reward";

export interface RewardConfigFormModalProps {
  open: boolean;
  onClose: () => void;
  initialConfig?: RewardConfigResponse | null;
  suggestedNextDay?: number;
  onCreate: (payload: CreateRewardConfigRequest) => Promise<unknown>;
  onUpdate: (
    configId: string,
    payload: UpdateRewardConfigRequest
  ) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function RewardConfigFormModal({
  open,
  onClose,
  initialConfig,
  suggestedNextDay = 1,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: RewardConfigFormModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEditing = Boolean(initialConfig);

  const [dayNumber, setDayNumber] = useState("1");
  const [chipsReward, setChipsReward] = useState("250");
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (initialConfig) {
      setDayNumber(String(initialConfig.dayNumber));
      setChipsReward(String(initialConfig.chipsReward));
      setActive(initialConfig.active);
    } else {
      setDayNumber(String(suggestedNextDay));
      setChipsReward("250");
      setActive(true);
    }
  }, [open, initialConfig, suggestedNextDay]);

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

    const parsedDay = dayNumber.trim() === "" ? undefined : Number(dayNumber);
    const parsedChips = Number(chipsReward);

    if (
      parsedDay !== undefined &&
      (!Number.isInteger(parsedDay) || parsedDay < 1)
    ) {
      setError("Day number must be a whole number of at least 1.");
      return;
    }

    if (!Number.isInteger(parsedChips) || parsedChips < 1) {
      setError("Chips reward must be a whole number of at least 1.");
      return;
    }

    try {
      if (isEditing && initialConfig) {
        const updatePayload: UpdateRewardConfigRequest = {
          dayNumber: parsedDay,
          chipsReward: parsedChips,
          active,
        };
        await onUpdate(initialConfig.id, updatePayload);
      } else {
        const createPayload: CreateRewardConfigRequest = {
          dayNumber: parsedDay,
          chipsReward: parsedChips,
          active,
        };
        await onCreate(createPayload);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save reward configuration."
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
          aria-labelledby="reward-form-modal-title"
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
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2
                  id="reward-form-modal-title"
                  className="text-lg font-bold text-slate-100"
                >
                  {isEditing ? "Update Day Reward" : "Create Day Reward"}
                </h2>
                <p className="text-xs text-neutral-400">
                  {isEditing
                    ? "Update chip payout or active state for this streak day."
                    : "Configure a chip reward for a specific daily streak day."}
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Day Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Chips Reward *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chipsReward}
                    onChange={(e) => setChipsReward(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Active reward day
                  </div>
                  <div className="text-xs text-neutral-400">
                    Players can claim active streak day rewards.
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
                  <span>{isEditing ? "Save Changes" : "Create Reward"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}