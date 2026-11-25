import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { DashboardKpiGrid } from "../../components/admin/dashboard/DashboardKpiGrid";
import { DashboardTrendsSection } from "../../components/admin/dashboard/DashboardTrendsSection";
import { DashboardPopularityCharts } from "../../components/admin/dashboard/DashboardPopularityCharts";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { useAnalyticsOverview, useAnalyticsPopularity, useAnalyticsTrends } from "../../hooks/useAnalytics";
import type { AnalyticsRange } from "../../types/analytics";

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export const AdminDashboardPage = () => {
  const [range, setRange] = useState<AnalyticsRange>("month");

  const overviewQuery = useAnalyticsOverview();
  const trendsQuery = useAnalyticsTrends(range);
  const popularityQuery = useAnalyticsPopularity();

  const isInitialLoading =
    (overviewQuery.isLoading && !overviewQuery.data) ||
    (trendsQuery.isLoading && !trendsQuery.data) ||
    (popularityQuery.isLoading && !popularityQuery.data);

  const hasError =
    overviewQuery.isError || trendsQuery.isError || popularityQuery.isError;

  const errorMessage =
    (overviewQuery.error instanceof Error && overviewQuery.error.message) ||
    (trendsQuery.error instanceof Error && trendsQuery.error.message) ||
    (popularityQuery.error instanceof Error && popularityQuery.error.message) ||
    "Unable to load analytics data.";

  const handleRefreshAll = () => {
    void overviewQuery.refetch();
    void trendsQuery.refetch();
    void popularityQuery.refetch();
  };

  return (
    <div className="flex flex-1 flex-col space-y-6 pb-10">
      <AdminPageHeader
        title="Dashboard Overview"
        subtitle="Track player growth, purchase revenue, and active room or plan popularity."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              role="group"
              aria-label="Analytics time range"
              className="inline-flex rounded-xl border border-neutral-800 bg-neutral-900/90 p-1"
            >
              {RANGE_OPTIONS.map((option) => {
                const active = range === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-amber-500 text-neutral-950 shadow-sm"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={
                overviewQuery.isFetching ||
                trendsQuery.isFetching ||
                popularityQuery.isFetching
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${
                  overviewQuery.isFetching ||
                  trendsQuery.isFetching ||
                  popularityQuery.isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {hasError && !isInitialLoading ? (
        <div className="flex min-h-[45vh] w-full flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Failed to load analytics"
            message={errorMessage}
            onRetry={handleRefreshAll}
          />
        </div>
      ) : (
        <>
          <DashboardKpiGrid
            overview={overviewQuery.data}
            isLoading={isInitialLoading}
          />

          <DashboardTrendsSection
            range={range}
            points={trendsQuery.data?.points ?? []}
            isLoading={trendsQuery.isLoading && !trendsQuery.data}
          />

          <DashboardPopularityCharts
            rooms={popularityQuery.data?.activeRooms ?? []}
            plans={popularityQuery.data?.activePlans ?? []}
            isLoading={isInitialLoading}
          />
        </>
      )}
    </div>
  );
};