import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useAdjustUserChips } from "../../../hooks/useAdminUsers";
import type { AdminUserSummary } from "../../../types/adminUser";

export interface AdjustUserChipsModalProps {
  user: AdminUserSummary | null;
  onClose: () => void;
  onAdjusted?: () => void;
}

export function AdjustUserChipsModal({
  user,
  onClose,
  onAdjusted,
}: AdjustUserChipsModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const adjustMutation = useAdjustUserChips();

  const [chipsInput, setChipsInput] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(user);
  const isSubmitting = adjustMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setChipsInput("");
    setReason("");
    setError(null);
  }, [open, user?.id]);

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
    if (!user) return;
    setError(null);

    const parsedChips = Number(chipsInput);
    if (!Number.isInteger(parsedChips) || parsedChips <= 0) {
      setError("Enter a valid positive whole number of chips.");
      return;
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length < 3) {
      setError("Reason must be at least 3 characters for audit logs.");
      return;
    }

    try {
      const res = await adjustMutation.mutateAsync({
        userId: user.id,
        payload: {
          chips: parsedChips,
          reason: trimmedReason,
        },
      });
      toast.success(
        `Added +${res.chipsAdded.toLocaleString("en-IN")} chips to ${user.name || user.email}.`
      );
      onAdjusted?.();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to adjust user chips.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <AnimatePresence>
      {open && user && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="adjust-user-chips-modal-title"
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
                  id="adjust-user-chips-modal-title"
                  className="text-lg font-bold text-slate-100"
                >
                  Add Chips to User Wallet
                </h2>
                <p className="text-xs text-neutral-400">
                  {user.name || "Unnamed Player"} ·{" "}
                  <span className="font-mono">{user.email}</span>
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
              <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5 text-xs">
                <span className="text-neutral-400">Current Balance</span>
                <span className="font-mono font-bold text-amber-300">
                  {user.walletBalance.toLocaleString("en-IN")} CHIPS
                </span>
              </div>

              <div>
                <label
                  htmlFor="adjust-user-chips-amount"
                  className="mb-1 block text-xs font-medium text-neutral-300"
                >
                  Chips to Add *
                </label>
                <input
                  id="adjust-user-chips-amount"
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={chipsInput}
                  onChange={(e) => {
                    setChipsInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. 2500"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder:text-neutral-500 focus:border-amber-400/70 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="adjust-user-chips-reason"
                  className="mb-1 block text-xs font-medium text-neutral-300"
                >
                  Reason for Adjustment *
                </label>
                <textarea
                  id="adjust-user-chips-reason"
                  rows={3}
                  required
                  maxLength={500}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Explain why chips are being credited (logged in audit trail & emailed to user)..."
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-500 focus:border-amber-400/70 focus:outline-none"
                />
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
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Add Chips</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}