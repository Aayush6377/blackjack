import { useEffect, useState } from "react";
import { Ticket, X } from "lucide-react";
import type {
  CouponResponse,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "../../../types/coupon";

interface CouponFormModalProps {
  open: boolean;
  editingCoupon: CouponResponse | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreate: (payload: CreateCouponRequest) => Promise<void>;
  onUpdate: (couponId: string, payload: UpdateCouponRequest) => Promise<void>;
}

function toDateTimeLocalValue(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDateTimeLocalValue(localValue: string): string | null {
  if (!localValue.trim()) return null;
  const parsed = new Date(localValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function CouponFormModal({
  open,
  editingCoupon,
  isSubmitting,
  onClose,
  onCreate,
  onUpdate,
}: CouponFormModalProps) {
  const isEdit = Boolean(editingCoupon);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [chipReward, setChipReward] = useState("500");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("1");
  const [hasGlobalLimit, setHasGlobalLimit] = useState(false);
  const [maxTotalUses, setMaxTotalUses] = useState("100");
  const [active, setActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);

    if (editingCoupon) {
      setCode(editingCoupon.code);
      setDescription(editingCoupon.description ?? "");
      setChipReward(String(editingCoupon.chipReward));
      setMaxUsesPerUser(String(editingCoupon.maxUsesPerUser));
      setHasGlobalLimit(editingCoupon.maxTotalUses !== null);
      setMaxTotalUses(
        editingCoupon.maxTotalUses !== null ? String(editingCoupon.maxTotalUses) : "100"
      );
      setActive(editingCoupon.active);
      setStartsAt(toDateTimeLocalValue(editingCoupon.startsAt));
      setExpiresAt(toDateTimeLocalValue(editingCoupon.expiresAt));
    } else {
      setCode("");
      setDescription("");
      setChipReward("500");
      setMaxUsesPerUser("1");
      setHasGlobalLimit(false);
      setMaxTotalUses("100");
      setActive(true);
      setStartsAt("");
      setExpiresAt("");
    }
  }, [open, editingCoupon]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = code.trim().toUpperCase();
    const rewardNum = Number(chipReward);
    const perUserNum = Number(maxUsesPerUser);
    const totalLimitNum = hasGlobalLimit ? Number(maxTotalUses) : null;

    if (!trimmedCode) {
      setErrorMsg("Coupon code is required.");
      return;
    }

    if (!Number.isInteger(rewardNum) || rewardNum < 1) {
      setErrorMsg("Chip reward must be a whole number of at least 1.");
      return;
    }

    if (!Number.isInteger(perUserNum) || perUserNum < 1) {
      setErrorMsg("Max claims per user must be at least 1.");
      return;
    }

    if (hasGlobalLimit) {
      if (
        totalLimitNum === null ||
        !Number.isInteger(totalLimitNum) ||
        totalLimitNum < 1
      ) {
        setErrorMsg("Global usage limit must be a whole number of at least 1.");
        return;
      }
      if (
        editingCoupon &&
        totalLimitNum < editingCoupon.timesRedeemed
      ) {
        setErrorMsg(
          `Global limit cannot be lower than already redeemed count (${editingCoupon.timesRedeemed}).`
        );
        return;
      }
    }

    const startIso = fromDateTimeLocalValue(startsAt);
    const endIso = fromDateTimeLocalValue(expiresAt);

    if (startIso && endIso && new Date(endIso) <= new Date(startIso)) {
      setErrorMsg("Expiration time must be later than start time.");
      return;
    }

    try {
      if (isEdit && editingCoupon) {
        await onUpdate(editingCoupon.id, {
          code: trimmedCode,
          description: description.trim() ? description.trim() : null,
          chipReward: rewardNum,
          maxUsesPerUser: perUserNum,
          maxTotalUses: totalLimitNum,
          active,
          startsAt: startIso,
          expiresAt: endIso,
        });
      } else {
        await onCreate({
          code: trimmedCode,
          description: description.trim() ? description.trim() : null,
          chipReward: rewardNum,
          maxUsesPerUser: perUserNum,
          maxTotalUses: totalLimitNum,
          active,
          startsAt: startIso,
          expiresAt: endIso,
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save coupon."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-slate-100 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-neutral-800/90 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-400">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="coupon-modal-title"
                className="text-lg font-bold text-white"
              >
                {isEdit ? `Edit Coupon: ${editingCoupon?.code}` : "Create Coupon"}
              </h2>
              <p className="text-xs text-neutral-400">
                {isEdit
                  ? "Update reward chips, claim limits, status, or validity window."
                  : "Set a unique code, chip reward, user/global limits, and optional dates."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3.5 py-2.5 text-xs font-medium text-rose-200"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ROYALE500"
                maxLength={60}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 font-mono text-sm font-semibold uppercase text-white placeholder-neutral-500 outline-none transition focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Chip Reward *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={chipReward}
                onChange={(e) => setChipReward(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 font-mono text-sm text-white outline-none transition focus:border-amber-400/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weekend high-roller bonus or welcome pack"
              maxLength={255}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-amber-400/60"
            />
          </div>

          {/* Claim Limits */}
          <div className="rounded-xl border border-neutral-800/90 bg-neutral-900/50 p-4 space-y-3.5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-neutral-300">
                  Max Claims Per User
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={maxUsesPerUser}
                  onChange={(e) => setMaxUsesPerUser(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 font-mono text-sm text-white outline-none transition focus:border-amber-400/60"
                />
                <p className="mt-1 text-[11px] text-neutral-400">
                  Defaults to 1 claim per player.
                </p>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300">
                    Global Usage Limit
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-amber-300">
                    <input
                      type="checkbox"
                      checked={hasGlobalLimit}
                      onChange={(e) => setHasGlobalLimit(e.target.checked)}
                      disabled={isSubmitting}
                      className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-900 accent-amber-400"
                    />
                    <span>Set limit</span>
                  </label>
                </div>

                {hasGlobalLimit ? (
                  <>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={maxTotalUses}
                      onChange={(e) => setMaxTotalUses(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 font-mono text-sm text-white outline-none transition focus:border-amber-400/60"
                    />
                    <p className="mt-1 text-[11px] text-neutral-400">
                      Total redemptions allowed across all players.
                    </p>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-950/60 px-3.5 py-2 text-xs text-neutral-400">
                    Unlimited total redemptions (bounded only by per-user limit &amp; dates).
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time Window */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Starts At (Optional)
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none transition focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Expires At (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white outline-none transition focus:border-amber-400/60"
              />
            </div>
          </div>

          {/* Active Status */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-white">Active Coupon</div>
              <div className="text-xs text-neutral-400">
                Inactive coupons cannot be redeemed by players.
              </div>
            </div>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-amber-400"
            />
          </label>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                ? "Update Coupon"
                : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}