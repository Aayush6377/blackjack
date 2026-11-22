import { Eye } from "lucide-react";
import type { AdminAuditLogResponse } from "../../../types/audit";
import { AuditActionBadge } from "./AuditActionBadge";

export interface AuditLogsTableProps {
  logs: AdminAuditLogResponse[];
  onInspect: (log: AdminAuditLogResponse) => void;
}

export function AuditLogsTable({ logs, onInspect }: AuditLogsTableProps) {
  return (
    <>
      {/* Desktop / Tablet Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-amber-500/20 bg-neutral-900/90 shadow-lg shadow-black/40 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/75 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="transition hover:bg-neutral-800/40"
              >
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <AuditActionBadge action={log.action} />
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-mono text-xs font-semibold text-slate-200">
                    {log.entityType}
                  </div>
                  <div className="max-w-[200px] truncate font-mono text-[11px] text-neutral-500">
                    {log.entityId || "—"}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-neutral-300">
                  {log.adminUsername || log.adminId || "System"}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-neutral-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onInspect(log)}
                    aria-label={`Inspect audit log ${log.id}`}
                    className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 p-2 text-amber-300 transition hover:border-amber-400/45 hover:bg-neutral-800"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards */}
      <div className="space-y-3 md:hidden">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-amber-500/20 bg-neutral-900/90 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <AuditActionBadge action={log.action} />
              <button
                type="button"
                onClick={() => onInspect(log)}
                aria-label={`Inspect audit log ${log.id}`}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 p-2 text-amber-300 transition hover:border-amber-400/45"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-1">
              <div>
                <span className="text-neutral-500">Entity: </span>
                <span className="font-mono text-amber-200/90">
                  {log.entityType}
                </span>
              </div>
              <div className="truncate">
                <span className="text-neutral-500">ID: </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {log.entityId || "—"}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">Admin: </span>
                <span>{log.adminUsername || log.adminId || "System"}</span>
              </div>
              <div className="font-mono text-[11px] text-neutral-500">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}