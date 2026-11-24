import { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Copy,
  Receipt,
} from "lucide-react";
import type { PurchaseHistoryItem, PurchaseStatus } from "../../types/payment";
import type { PageResponse } from "../../types/page";

interface PurchasesTableProps {
  data: PageResponse<PurchaseHistoryItem>;
  isFetching: boolean;
  onPageChange: (nextPage: number) => void;
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

function getStatusBadge(status: PurchaseStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "SUCCESS":
    case "COMPLETED":
    case "PAID":
      return {
        label: "Paid",
        className:
          "border-emerald-500/35 bg-emerald-500/15 text-emerald-300",
      };
    case "PENDING":
    case "INITIATED":
      return {
        label: "Pending",
        className:
          "border-amber-400/35 bg-amber-500/15 text-amber-300",
      };
    case "FAILED":
    case "CANCELLED":
      return {
        label: "Failed",
        className:
          "border-rose-500/35 bg-rose-500/15 text-rose-300",
      };
    default:
      return {
        label: status,
        className: "border-zinc-700 bg-zinc-800 text-zinc-300",
      };
  }
}

export function PurchasesTable({
  data,
  isFetching,
  onPageChange,
}: PurchasesTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1500);
    } catch {
      // Ignore clipboard permission errors
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/80">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white sm:text-base">
            Order History
          </h2>
          {isFetching && (
            <span className="text-[11px] font-medium text-amber-300">
              Updating...
            </span>
          )}
        </div>

        <span className="text-xs text-zinc-400">
          {data.totalElements} {data.totalElements === 1 ? "order" : "orders"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[740px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800/90 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Chips Credited</th>
              <th className="px-5 py-3">Amount Paid</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Receipt ID</th>
              <th className="px-5 py-3 text-right">Date &amp; Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {data.items.map((item) => {
              const badge = getStatusBadge(item.status);
              const isCopied = copiedId === item.id;

              return (
                <tr
                  key={item.id}
                  className="transition hover:bg-zinc-800/35"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-white">
                      {item.planName}
                    </div>
                    {item.planId === null && (
                      <span className="mt-0.5 inline-block text-[11px] text-zinc-500">
                        Plan no longer in store
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300">
                      <Coins className="h-3.5 w-3.5 text-amber-400" />
                      +{item.chipsAwarded.toLocaleString("en-IN")} Chips
                    </span>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-white">
                    {formatInrFromPaise(item.amountInPaise)}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => void handleCopyId(item.id)}
                      title={`Copy receipt ID: ${item.id}`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 font-mono text-[11px] text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                    >
                      <span>{item.id.slice(0, 8)}...</span>
                      {isCopied ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-zinc-400" />
                      )}
                    </button>
                  </td>

                  <td className="px-5 py-3.5 text-right text-xs text-zinc-400">
                    {formatDateTime(item.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950/50 px-5 py-3.5 text-xs text-zinc-400 sm:flex-row">
          <div>
            Page{" "}
            <span className="font-semibold text-white">{data.page + 1}</span> of{" "}
            <span className="font-semibold text-white">{data.totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPrevious || isFetching}
              onClick={() => onPageChange(Math.max(0, data.page - 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!data.hasNext || isFetching}
              onClick={() => onPageChange(data.page + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-semibold text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}