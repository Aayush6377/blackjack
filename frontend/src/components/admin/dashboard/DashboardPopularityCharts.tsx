import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PopularitySlice } from "../../../types/analytics";

interface DashboardPopularityChartsProps {
  rooms: PopularitySlice[];
  plans: PopularitySlice[];
  isLoading: boolean;
}

const CHART_COLORS = [
  "#f59e0b",
  "#10b981",
  "#38bdf8",
  "#a78bfa",
  "#f43f5e",
  "#fb923c",
];

function PopularityPieCard({
  eyebrow,
  title,
  metricLabel,
  slices,
}: {
  eyebrow: string;
  title: string;
  metricLabel: string;
  slices: PopularitySlice[];
}) {
  const totalCount = slices.reduce((acc, item) => acc + item.count, 0);

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
      <div className="mb-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
          {eyebrow}
        </div>
        <h2 className="mt-0.5 text-base font-bold text-slate-100">{title}</h2>
      </div>

      {slices.length === 0 || totalCount === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-neutral-800 text-xs text-neutral-400">
          No active {metricLabel.toLowerCase()} activity recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {slices.map((entry, idx) => (
                    <Cell
                      key={entry.id}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      stroke="#171717"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {slices.map((item, idx) => {
              const pct =
                totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800/80 bg-neutral-950/60 px-3 py-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                      }}
                    />
                    <span className="truncate font-medium text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="shrink-0 font-mono text-neutral-300">
                    {item.count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export function DashboardPopularityCharts({
  rooms,
  plans,
  isLoading,
}: DashboardPopularityChartsProps) {
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
      <PopularityPieCard
        eyebrow="Active Rooms"
        title="Most Popular Game Rooms"
        metricLabel="Rooms"
        slices={rooms}
      />

      <PopularityPieCard
        eyebrow="Active Plans"
        title="Most Popular Chip Plans"
        metricLabel="Plans"
        slices={plans}
      />
    </div>
  );
}