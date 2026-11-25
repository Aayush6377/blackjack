import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Coins, Copy, Receipt } from "lucide-react";
import type { AdminUserPurchaseItem } from "../../../types/adminUser";
import type { PageResponse } from "../../../types/page";

interface AdminUserPurchasesTableProps {
  purchasesPage: PageResponse<AdminUserPurchaseItem>;
  limit: number;
  isFetching: boolean;
  onPageChange: (nextPage: number) => void;
  onLimitChange: (nextLimit: number) => void;
}

const LIMIT_OPTIONS = [5, 10, 20, 50] as const;

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

function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "SUCCESS":
    case "COMPLETED":
    case "PAID":
      return "border-emerald-500/35 bg-emerald-500/10 text-emerald-300";
    case "PENDING":
    case "INITIATED":
      return "border-amber-400/35 bg-amber-500/10 text-amber-300";
    case "FAILED":
    case "CANCELLED":
      return "border-rose-500/35 bg-rose-500/10 text-rose-300";
    default:
      return "border-neutral-700 bg-neutral-800/80 text-neutral-300";
  }
}

export function AdminUserPurchasesTable({
  purchasesPage,
  limit,
  isFetching,
  onPageChange,
  onLimitChange,
}: AdminUserPurchasesTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const items = purchasesPage.items;
  const currentPage = purchasesPage.page;
  const totalPages = purchasesPage.totalPages;
  const totalElements = purchasesPage.totalElements;

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1500);
    } 
    catch {}
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-neutral-800/90 bg-neutral-950/90">
        {/* Table Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/90 bg-neutral-900/70 px-5 py-3.5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
            <Receipt className="h-3.5 w-3.5" />
            <span>Payment &amp; Purchase History</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>
              Total:{" "}
              <strong className="font-mono font-semibold text-slate-200">
                {totalElements}
              </strong>
            </span>

            <label className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950/85 px-2.5 py-1 text-[11px] text-neutral-400">
              <select
                aria-label="Purchases per page"
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="cursor-pointer bg-transparent font-mono font-bold text-amber-400 focus:outline-none"
              >
                {LIMIT_OPTIONS.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="bg-neutral-900 text-slate-100"
                  >
                    {opt} / page
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[14rem] flex-col items-center justify-center px-6 py-10 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-200">
              No payment records for this user
            </h3>
            <p className="mt-1 max-w-sm text-xs text-neutral-400">
              This player hasn&apos;t made any chip pack purchases yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800/90 bg-neutral-900/40 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Chips Credited</th>
                  <th className="px-5 py-3">Amount Paid</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Receipt ID</th>
                  <th className="px-5 py-3 text-right">Date &amp; Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800/75">
                {items.map((purchase) => {
                  const isCopied = copiedId === purchase.id;

                  return (
                    <tr
                      key={purchase.id}
                      className="transition hover:bg-neutral-900/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-100">
                          {purchase.planName}
                        </div>
                        {purchase.planId === null && (
                          <div className="text-[11px] text-neutral-500">
                            Archived plan
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-amber-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5 text-amber-400" />
                          <span>+{purchase.chipsAwarded.toLocaleString("en-IN")}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-100">
                        {formatInrFromPaise(purchase.amountInPaise)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                            purchase.status
                          )}`}
                        >
                          {purchase.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => void handleCopyId(purchase.id)}
                          title={`Copy receipt ID: ${purchase.id}`}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 font-mono text-[11px] text-neutral-300 transition hover:border-amber-400/40 hover:text-amber-200"
                        >
                          <span>{purchase.id.slice(0, 8)}...</span>
                          {isCopied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-neutral-400" />
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono text-xs text-neutral-400">
                        {formatDateTime(purchase.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-neutral-800/90 bg-neutral-900/75 px-4 py-3 text-xs text-neutral-400 sm:flex-row">
          <div>
            Showing{" "}
            <span className="font-mono font-semibold text-slate-200">
              {items.length}
            </span>{" "}
            of{" "}
            <span className="font-mono font-semibold text-slate-200">
              {totalElements}
            </span>{" "}
            entries • Page{" "}
            <span className="font-mono font-semibold text-slate-200">
              {totalPages > 0 ? currentPage + 1 : 0}
            </span>{" "}
            of{" "}
            <span className="font-mono font-semibold text-slate-200">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              disabled={!purchasesPage.hasPrevious || isFetching}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!purchasesPage.hasNext || isFetching}
              className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}