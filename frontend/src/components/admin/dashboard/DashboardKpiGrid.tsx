import { Coins, Layers, ShoppingBag, Spade, Users } from "lucide-react";
import type { AnalyticsOverviewResponse } from "../../../types/analytics";
import { formatRupeesFromPaise } from "../../../utils/formatCurrency";

interface DashboardKpiGridProps {
  overview?: AnalyticsOverviewResponse;
  isLoading: boolean;
}

function formatNumber(val: number): string {
  return val.toLocaleString("en-IN");
}

export function DashboardKpiGrid({
  overview,
  isLoading,
}: DashboardKpiGridProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Players",
      sublabel: "Non-admin accounts",
      value: formatNumber(overview.totalNonAdminUsers),
      exactTitle: undefined,
      icon: Users,
      accent: "text-amber-400 border-amber-400/25 bg-amber-500/10",
    },
    {
      label: "Purchase Revenue",
      sublabel: `${formatNumber(overview.totalCompletedPurchases)} completed orders`,
      value: formatRupeesFromPaise(overview.totalRevenue, { compact: true }),
      exactTitle: formatRupeesFromPaise(overview.totalRevenue, { compact: false }),
      icon: Coins,
      accent: "text-emerald-400 border-emerald-400/25 bg-emerald-500/10",
    },
    {
      label: "Active Rooms",
      sublabel: "Live tables enabled",
      value: formatNumber(overview.activeRooms),
      exactTitle: undefined,
      icon: Spade,
      accent: "text-sky-400 border-sky-400/25 bg-sky-500/10",
    },
    {
      label: "Active Plans",
      sublabel: "Chip packs available",
      value: formatNumber(overview.activePlans),
      exactTitle: undefined,
      icon: ShoppingBag,
      accent: "text-violet-400 border-violet-400/25 bg-violet-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  {card.label}
                </div>
                <div
                  title={card.exactTitle}
                  className="mt-1.5 font-mono text-2xl font-extrabold text-slate-100"
                >
                  {card.value}
                </div>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${card.accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-400">
              <Layers className="h-3 w-3 text-neutral-500" />
              <span>{card.sublabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}