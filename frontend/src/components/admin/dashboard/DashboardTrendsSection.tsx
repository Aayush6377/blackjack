import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsRange, TimeSeriesPoint } from "../../../types/analytics";
import { formatRupeeValue, paiseToRupees } from "../../../utils/formatCurrency";

interface DashboardTrendsSectionProps {
  range: AnalyticsRange;
  points: TimeSeriesPoint[];
  isLoading: boolean;
}

const RANGE_COPY: Record<AnalyticsRange, string> = {
  week: "Last 7 days",
  month: "Last 30 days",
  year: "Last 12 months",
};

export function DashboardTrendsSection({
  range,
  points,
  isLoading,
}: DashboardTrendsSectionProps) {
  const chartData = useMemo(
    () =>
      points.map((point) => ({
        ...point,
        revenueInRupees: paiseToRupees(point.revenue),
      })),
    [points]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5" />
        <div className="h-80 animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Users Joined Chart */}
      <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
              User Acquisition
            </div>
            <h2 className="mt-0.5 text-base font-bold text-slate-100">
              New Users Joined
            </h2>
          </div>
          <span className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-300">
            {RANGE_COPY[range]}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={{ stroke: "#262626" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="newUsers"
                name="New Users"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Revenue Chart */}
      <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400">
              Purchases &amp; Billing
            </div>
            <h2 className="mt-0.5 text-base font-bold text-slate-100">
              Revenue Trend
            </h2>
          </div>
          <span className="rounded-lg border border-neutral-800 bg-neutral-950/80 px-2.5 py-1 text-[11px] font-semibold text-neutral-300">
            {RANGE_COPY[range]}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={{ stroke: "#262626" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={68}
                tickFormatter={(value: number) =>
                  formatRupeeValue(value, { compact: true })
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatRupeeValue(Number(value ?? 0), { compact: true }),
                  "Revenue",
                ]}
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenueInRupees"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}