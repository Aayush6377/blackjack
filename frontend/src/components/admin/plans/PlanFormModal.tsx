import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, X } from "lucide-react";
import type {
  ChipPlanResponse,
  CreateChipPlanRequest,
  UpdateChipPlanRequest,
} from "../../../types/plan";

export interface PlanFormModalProps {
  open: boolean;
  onClose: () => void;
  initialPlan?: ChipPlanResponse | null;
  onCreate: (payload: CreateChipPlanRequest) => Promise<unknown>;
  onUpdate: (planId: string, payload: UpdateChipPlanRequest) => Promise<unknown>;
  isSubmitting?: boolean;
}

function toDateTimeLocalValue(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoOrNull(localValue: string): string | null {
  if (!localValue.trim()) return null;
  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function PlanFormModal({
  open,
  onClose,
  initialPlan,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: PlanFormModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEditing = Boolean(initialPlan);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chips, setChips] = useState("1000");
  const [bonusChips, setBonusChips] = useState("0");
  const [priceRupees, setPriceRupees] = useState("99");
  const [active, setActive] = useState(true);
  const [saleName, setSaleName] = useState("");
  const [salePriceRupees, setSalePriceRupees] = useState("");
  const [saleStartAt, setSaleStartAt] = useState("");
  const [saleEndAt, setSaleEndAt] = useState("");
  const [clearSale, setClearSale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setClearSale(false);

    if (initialPlan) {
      setName(initialPlan.name);
      setDescription(initialPlan.description ?? "");
      setChips(String(initialPlan.chips));
      setBonusChips(String(initialPlan.bonusChips));
      setPriceRupees(String(initialPlan.priceInPaise / 100));
      setActive(initialPlan.active);
      setSaleName(initialPlan.saleName ?? "");
      setSalePriceRupees(
        initialPlan.salePriceInPaise != null
          ? String(initialPlan.salePriceInPaise / 100)
          : ""
      );
      setSaleStartAt(toDateTimeLocalValue(initialPlan.saleStartAt));
      setSaleEndAt(toDateTimeLocalValue(initialPlan.saleEndAt));
    } else {
      setName("");
      setDescription("");
      setChips("1000");
      setBonusChips("0");
      setPriceRupees("99");
      setActive(true);
      setSaleName("");
      setSalePriceRupees("");
      setSaleStartAt("");
      setSaleEndAt("");
    }
  }, [open, initialPlan]);

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

    const trimmedName = name.trim();
    const parsedChips = Number(chips);
    const parsedBonus = Number(bonusChips || 0);
    const parsedPriceRupees = Number(priceRupees);

    if (!trimmedName) {
      setError("Plan name is required.");
      return;
    }
    if (!Number.isInteger(parsedChips) || parsedChips < 1) {
      setError("Base chips must be a whole number of at least 1.");
      return;
    }
    if (!Number.isInteger(parsedBonus) || parsedBonus < 0) {
      setError("Bonus chips must be 0 or greater.");
      return;
    }
    if (Number.isNaN(parsedPriceRupees) || parsedPriceRupees < 0) {
      setError("Price must be ₹0 or greater.");
      return;
    }

    const priceInPaise = Math.round(parsedPriceRupees * 100);

    let salePriceInPaise: number | null = null;
    if (!clearSale && salePriceRupees.trim() !== "") {
      const parsedSaleRupees = Number(salePriceRupees);
      if (Number.isNaN(parsedSaleRupees) || parsedSaleRupees < 0) {
        setError("Sale price must be ₹0 or greater.");
        return;
      }
      salePriceInPaise = Math.round(parsedSaleRupees * 100);
    }

    const isoStart = clearSale ? null : toIsoOrNull(saleStartAt);
    const isoEnd = clearSale ? null : toIsoOrNull(saleEndAt);

    if (isoStart && isoEnd && new Date(isoEnd) <= new Date(isoStart)) {
      setError("Sale end time must be after sale start time.");
      return;
    }

    try {
      if (isEditing && initialPlan) {
        const updatePayload: UpdateChipPlanRequest = {
          name: trimmedName,
          description: description.trim() || null,
          chips: parsedChips,
          bonusChips: parsedBonus,
          priceInPaise,
          active,
          clearSale,
          saleName: clearSale ? null : saleName.trim() || null,
          salePriceInPaise,
          saleStartAt: isoStart,
          saleEndAt: isoEnd,
        };
        await onUpdate(initialPlan.id, updatePayload);
      } else {
        const createPayload: CreateChipPlanRequest = {
          name: trimmedName,
          description: description.trim() || null,
          chips: parsedChips,
          bonusChips: parsedBonus,
          priceInPaise,
          active,
          saleName: saleName.trim() || null,
          salePriceInPaise,
          saleStartAt: isoStart,
          saleEndAt: isoEnd,
        };
        await onCreate(createPayload);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save chip plan."
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
          aria-labelledby="plan-form-modal-title"
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
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-amber-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2
                  id="plan-form-modal-title"
                  className="text-lg font-bold text-slate-100"
                >
                  {isEditing ? "Update Chip Plan" : "Create Chip Plan"}
                </h2>
                <p className="text-xs text-neutral-400">
                  {isEditing
                    ? "Modify chip allocation, pricing, availability, or sale window."
                    : "Configure a new chip bundle for player purchases."}
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
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="High Roller Pack"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-600 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional plan details shown to players"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-600 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Base Chips *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chips}
                    onChange={(e) => setChips(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Bonus Chips
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bonusChips}
                    onChange={(e) => setBonusChips(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-300">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                  />
                </div>
              </div>

              {/* Sale Configuration Section */}
              <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/85">
                    Promotional Sale (Optional)
                  </span>
                  {isEditing && (
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={clearSale}
                        onChange={(e) => setClearSale(e.target.checked)}
                        disabled={isSubmitting}
                        className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-400/40"
                      />
                      <span>Clear sale</span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Sale Label
                    </label>
                    <input
                      type="text"
                      value={saleName}
                      onChange={(e) => setSaleName(e.target.value)}
                      placeholder="Weekend Boost"
                      disabled={isSubmitting || clearSale}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 px-3 py-2 text-sm text-slate-100 placeholder:text-neutral-600 disabled:opacity-45 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Sale Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={salePriceRupees}
                      onChange={(e) => setSalePriceRupees(e.target.value)}
                      placeholder="79"
                      disabled={isSubmitting || clearSale}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 px-3 py-2 font-mono text-sm text-slate-100 placeholder:text-neutral-600 disabled:opacity-45 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Sale Start
                    </label>
                    <input
                      type="datetime-local"
                      value={saleStartAt}
                      onChange={(e) => setSaleStartAt(e.target.value)}
                      disabled={isSubmitting || clearSale}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 px-3 py-2 text-xs text-slate-100 disabled:opacity-45 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-300">
                      Sale End
                    </label>
                    <input
                      type="datetime-local"
                      value={saleEndAt}
                      onChange={(e) => setSaleEndAt(e.target.value)}
                      disabled={isSubmitting || clearSale}
                      className="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 px-3 py-2 text-xs text-slate-100 disabled:opacity-45 focus:border-amber-400/70 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-3.5 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Active for players
                  </div>
                  <div className="text-xs text-neutral-400">
                    Only active plans appear in the player chip store.
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

              {/* Actions */}
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
                  <span>{isEditing ? "Save Changes" : "Create Plan"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}