import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { AdminAuditLogResponse } from "../../../types/audit";
import { AuditActionBadge } from "./AuditActionBadge";
import { AuditValuesComparison } from "./AuditValuesComparison";

export interface AuditLogDetailModalProps {
  log: AdminAuditLogResponse | null;
  onClose: () => void;
}

export function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!log) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [log, onClose]);

  return (
    <AnimatePresence>
      {log && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="audit-detail-modal-title"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 10 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-amber-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="audit-detail-modal-title"
                    className="text-lg font-bold text-slate-100"
                  >
                    Audit Log Details
                  </h2>
                  <AuditActionBadge action={log.action} />
                </div>
                <p className="font-mono text-xs text-neutral-400">
                  Log ID: {log.id}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5 text-xs sm:grid-cols-2">
              <div>
                <span className="text-neutral-500">Admin</span>
                <div className="mt-0.5 font-medium text-slate-200">
                  {log.adminUsername || log.adminId || "Unknown"}
                </div>
              </div>

              <div>
                <span className="text-neutral-500">Timestamp</span>
                <div className="mt-0.5 font-mono text-slate-200">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-neutral-500">Entity Type</span>
                <div className="mt-0.5 font-mono text-amber-300">
                  {log.entityType}
                </div>
              </div>

              <div>
                <span className="text-neutral-500">Entity ID</span>
                <div className="mt-0.5 break-all font-mono text-slate-300">
                  {log.entityId || "—"}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Value Changes
              </h3>
              <AuditValuesComparison
                oldValues={log.oldValues}
                newValues={log.newValues}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}