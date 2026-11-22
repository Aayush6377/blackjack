import type { ReactNode } from "react";

interface AuditValuesComparisonProps {
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}

function isEmptyRecord(record?: Record<string, unknown> | null): boolean {
  return !record || Object.keys(record).length === 0;
}

function isRewardItemArray(value: unknown): value is Array<{
  id?: unknown;
  dayNumber?: unknown;
  chipsReward?: unknown;
  active?: unknown;
}> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        ("dayNumber" in item || "chipsReward" in item)
    )
  );
}

function renderFormattedValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-neutral-500">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold ${
          value
            ? "border-emerald-500/30 bg-emerald-950/50 text-emerald-300"
            : "border-neutral-700 bg-neutral-800/80 text-neutral-400"
        }`}
      >
        {value ? "true" : "false"}
      </span>
    );
  }

  if (typeof value === "number") {
    return (
      <span className="font-mono font-semibold tabular-nums text-slate-100">
        {value.toLocaleString("en-IN")}
      </span>
    );
  }

  if (typeof value === "string") {
    return <span className="font-mono text-slate-200">{value}</span>;
  }

  // Pretty list/pills for bulk reward items instead of raw JSON dump
  if (isRewardItemArray(value)) {
    return (
      <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900/90 p-2">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          {value.length} item(s)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, idx) => (
            <span
              key={String(item.id ?? idx)}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/25 bg-neutral-950/90 px-2 py-1 font-mono text-[11px] text-amber-200"
            >
              {item.dayNumber !== undefined && (
                <span className="font-bold text-amber-400">
                  Day {String(item.dayNumber)}
                </span>
              )}
              {item.chipsReward !== undefined && (
                <span>
                  +{Number(item.chipsReward).toLocaleString("en-IN")} chips
                </span>
              )}
              {item.active === false && (
                <span className="text-[10px] text-neutral-500">(inactive)</span>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((entry, idx) => (
          <span
            key={idx}
            className="rounded-md border border-neutral-700/80 bg-neutral-900 px-2 py-0.5 font-mono text-[11px] text-slate-200"
          >
            {typeof entry === "object" && entry !== null
              ? JSON.stringify(entry)
              : String(entry)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-neutral-500">—</span>;
    }
    return (
      <div className="space-y-1 rounded-lg border border-neutral-800 bg-neutral-900/90 p-2.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 text-[11px]">
            <span className="font-mono text-neutral-400">{k}</span>
            <span className="font-mono font-medium text-slate-200">
              {typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <pre className="max-h-44 overflow-auto rounded-lg border border-neutral-800 bg-neutral-900/90 p-2 font-mono text-[11px] whitespace-pre-wrap text-slate-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function renderCellContent(
  record: Record<string, unknown> | null | undefined,
  fieldKey: string,
  highlightChanged: boolean
): ReactNode {
  const hasKey =
    record != null && Object.prototype.hasOwnProperty.call(record, fieldKey);

  if (!hasKey) {
    return (
      <span className="inline-block whitespace-nowrap text-[11px] italic text-neutral-500">
        No data available
      </span>
    );
  }

  const content = renderFormattedValue(record[fieldKey]);
  return (
    <div className={highlightChanged ? "rounded-md ring-1 ring-amber-400/25" : undefined}>
      {content}
    </div>
  );
}

export function AuditValuesComparison({
  oldValues,
  newValues,
}: AuditValuesComparisonProps) {
  const oldEmpty = isEmptyRecord(oldValues);
  const newEmpty = isEmptyRecord(newValues);

  if (oldEmpty && newEmpty) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-8 text-center text-xs text-neutral-400">
        No data available
      </div>
    );
  }

  const allKeys = Array.from(
    new Set([
      ...Object.keys(oldValues ?? {}),
      ...Object.keys(newValues ?? {}),
    ])
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Previous Snapshot
          </div>
          <div className="mt-1 text-xs text-neutral-300">
            {oldEmpty
              ? "No data available"
              : `${Object.keys(oldValues!).length} field(s) recorded`}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/90">
            Updated Snapshot
          </div>
          <div className="mt-1 text-xs text-neutral-300">
            {newEmpty
              ? "No data available"
              : `${Object.keys(newValues!).length} field(s) recorded`}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/70">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/90 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="w-28 px-3.5 py-2.5">Field</th>
              <th className="min-w-[140px] px-3.5 py-2.5">Old Value</th>
              <th className="px-3.5 py-2.5">New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 align-top">
            {allKeys.map((key) => {
              const hasOld =
                oldValues != null &&
                Object.prototype.hasOwnProperty.call(oldValues, key);
              const hasNew =
                newValues != null &&
                Object.prototype.hasOwnProperty.call(newValues, key);

              const changed =
                hasOld &&
                hasNew &&
                JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]);

              return (
                <tr
                  key={key}
                  className={changed ? "bg-amber-500/[0.04]" : undefined}
                >
                  <td className="px-3.5 py-3 font-mono font-medium text-slate-200">
                    {key}
                  </td>
                  <td className="px-3.5 py-3">
                    {renderCellContent(oldValues, key, false)}
                  </td>
                  <td className="px-3.5 py-3">
                    {renderCellContent(newValues, key, changed)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}