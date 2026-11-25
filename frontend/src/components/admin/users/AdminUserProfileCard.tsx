import { useState } from "react";
import {
  Ban,
  Calendar,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  IndianRupee,
  Mail,
  Receipt,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { AdminUserDetail } from "../../../types/adminUser";

interface AdminUserProfileCardProps {
  user: AdminUserDetail;
  isTogglingStatus: boolean;
  onToggleEnabled: () => void;
  onOpenAddChips: () => void;
}

function formatInrFromPaise(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null, email?: string): string {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminUserProfileCard({
  user,
  isTogglingStatus,
  onToggleEnabled,
  onOpenAddChips,
}: AdminUserProfileCardProps) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 1500);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Big Profile Avatar + Identity */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name || user.email}
              className="h-24 w-24 shrink-0 rounded-2xl border-2 border-amber-400/35 object-cover shadow-md shadow-black/50 sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-400/35 bg-amber-500/10 font-mono text-2xl font-extrabold text-amber-300 sm:h-28 sm:w-28 sm:text-3xl">
              {getInitials(user.name, user.email)}
            </div>
          )}

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
                {user.name || "Unnamed Player"}
              </h2>

              {user.enabled ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>ENABLED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/35 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                  <Ban className="h-3 w-3" />
                  <span>DISABLED</span>
                </span>
              )}

              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                  <ShieldCheck className="h-3 w-3" />
                  <span>VERIFIED</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-300">
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                <span>{user.email}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 text-neutral-400">
                <UserCheck className="h-3.5 w-3.5 text-neutral-500" />
                <span>Role: {user.role}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                <span>Joined {formatDateTime(user.createdAt)}</span>
              </span>

              <button
                type="button"
                onClick={() => void handleCopyId()}
                title="Copy full User ID"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/85 px-2.5 py-1 font-mono text-[11px] text-neutral-300 transition hover:border-amber-400/40 hover:text-amber-200"
              >
                <span>ID: {user.id.slice(0, 8)}...</span>
                {copiedId ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-neutral-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions: Enable/Disable + Add Chips */}
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          <button
            type="button"
            disabled={isTogglingStatus}
            onClick={onToggleEnabled}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              user.enabled
                ? "border-rose-500/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                : "border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            }`}
          >
            <span>
              {isTogglingStatus
                ? "Saving..."
                : user.enabled
                ? "Disable Account"
                : "Enable Account"}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenAddChips}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400"
          >
            <Coins className="h-4 w-4" />
            <span>Add Chips</span>
          </button>
        </div>
      </div>

      {/* Wallet & Purchase Summary Strip */}
      <div className="mt-6 grid grid-cols-1 gap-3 border-t border-neutral-800/90 pt-5 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/75 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Wallet Balance</span>
            <Coins className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 font-mono text-lg font-extrabold text-amber-300">
            {user.walletBalance.toLocaleString("en-IN")} CHIPS
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/75 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Total Paid (Success)</span>
            <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5 font-mono text-lg font-extrabold text-emerald-300">
            {formatInrFromPaise(user.totalPaidInPaise)}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/75 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Total Orders</span>
            <Receipt className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 font-mono text-lg font-extrabold text-slate-100">
            {user.totalPurchases.toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </section>
  );
}