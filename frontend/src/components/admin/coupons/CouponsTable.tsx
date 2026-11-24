import { Coins, Pencil, Power, Trash2 } from "lucide-react";
import type { CouponResponse } from "../../../types/coupon";

interface CouponsTableProps {
  coupons: CouponResponse[];
  busyCouponId: string | null;
  onEdit: (coupon: CouponResponse) => void;
  onToggleActive: (coupon: CouponResponse) => void;
  onDelete: (coupon: CouponResponse) => void;
}

function formatDateCompact(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWindowBadge(coupon: CouponResponse): {
  label: string;
  className: string;
} {
  if (!coupon.active) {
    return {
      label: "Inactive",
      className:
        "border-neutral-700 bg-neutral-800/80 text-neutral-400",
    };
  }

  const now = Date.now();
  if (coupon.startsAt && now < new Date(coupon.startsAt).getTime()) {
    return {
      label: "Scheduled",
      className:
        "border-sky-500/35 bg-sky-500/10 text-sky-300",
    };
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt).getTime()) {
    return {
      label: "Expired",
      className:
        "border-rose-500/35 bg-rose-500/10 text-rose-300",
    };
  }

  return {
    label: "Active",
    className:
      "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
  };
}

export function CouponsTable({
  coupons,
  busyCouponId,
  onEdit,
  onToggleActive,
  onDelete,
}: CouponsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/75">
      <table className="w-full min-w-[780px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <th className="px-4 py-3.5">Coupon</th>
            <th className="px-4 py-3.5">Reward</th>
            <th className="px-4 py-3.5">Usage</th>
            <th className="px-4 py-3.5">Per User</th>
            <th className="px-4 py-3.5">Window</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/80">
          {coupons.map((coupon) => {
            const isBusy = busyCouponId === coupon.id;
            const statusBadge = getWindowBadge(coupon);

            return (
              <tr
                key={coupon.id}
                className="transition hover:bg-neutral-800/35"
              >
                <td className="px-4 py-3.5">
                  <div className="font-mono text-sm font-bold text-amber-300">
                    {coupon.code}
                  </div>
                  {coupon.description && (
                    <div className="mt-0.5 max-w-xs truncate text-xs text-neutral-400">
                      {coupon.description}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    +{coupon.chipReward.toLocaleString("en-IN")}
                  </span>
                </td>

                <td className="px-4 py-3.5 font-mono text-xs text-neutral-200">
                  {coupon.timesRedeemed.toLocaleString("en-IN")}
                  {coupon.maxTotalUses !== null
                    ? ` / ${coupon.maxTotalUses.toLocaleString("en-IN")}`
                    : " / Unlimited"}
                </td>

                <td className="px-4 py-3.5 font-mono text-xs text-neutral-300">
                  {coupon.maxUsesPerUser}x
                </td>

                <td className="px-4 py-3.5 text-xs text-neutral-400">
                  <div>From: {formatDateCompact(coupon.startsAt)}</div>
                  <div>To: {formatDateCompact(coupon.expiresAt)}</div>
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </td>

                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onToggleActive(coupon)}
                      title={coupon.active ? "Deactivate coupon" : "Activate coupon"}
                      className={`inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                        coupon.active
                          ? "border-amber-500/35 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          : "border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      <span>{coupon.active ? "Deactivate" : "Activate"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onEdit(coupon)}
                      title="Edit coupon"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-700 disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDelete(coupon)}
                      title="Delete coupon"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-500/35 bg-rose-950/40 px-2.5 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-900/50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}