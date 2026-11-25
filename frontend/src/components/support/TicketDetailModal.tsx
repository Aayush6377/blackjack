import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Clock, MessageSquareCheck, ShieldCheck, X } from "lucide-react";
import type { SupportTicketResponse, TicketCategory, TicketStatus } from "../../types/support";

interface TicketDetailModalProps {
  ticket: SupportTicketResponse | null;
  onClose: () => void;
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  OPEN: "border-amber-400/35 bg-amber-500/15 text-amber-300",
  IN_PROGRESS: "border-sky-400/35 bg-sky-500/15 text-sky-300",
  RESOLVED: "border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
  CLOSED: "border-neutral-700 bg-neutral-800 text-neutral-300",
};

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  PAYMENT_OR_CHIPS: "Payment & Chips",
  GAMEPLAY_OR_ROOM: "Gameplay & Rooms",
  ACCOUNT: "Account & Security",
  BUG_REPORT: "Bug Report",
  OTHER: "Other Query",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const isOpen = Boolean(ticket);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {ticket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-detail-title"
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
            className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-amber-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      STATUS_BADGE[ticket.status]
                    }`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="rounded-full border border-neutral-800 bg-neutral-950/80 px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
                    {CATEGORY_LABEL[ticket.category]}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    #{ticket.id.slice(0, 8)}
                  </span>
                </div>

                <h2
                  id="ticket-detail-title"
                  className="mt-2 text-lg font-bold text-slate-100 sm:text-xl"
                >
                  {ticket.subject}
                </h2>

                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Raised {formatDateTime(ticket.createdAt)}</span>
                </div>
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

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Your Message
                </div>
                <div className="whitespace-pre-wrap rounded-xl border border-neutral-800 bg-neutral-950/75 p-4 text-sm leading-relaxed text-slate-200">
                  {ticket.message}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                    <MessageSquareCheck className="h-4 w-4" />
                    <span>Admin Resolution</span>
                  </div>
                  {ticket.resolvedAt && (
                    <span className="text-[11px] text-neutral-400">
                      Resolved {formatDateTime(ticket.resolvedAt)}
                    </span>
                  )}
                </div>

                {ticket.adminResolution ? (
                  <>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                      {ticket.adminResolution}
                    </p>
                    {ticket.resolvedByAdminName && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300/90">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Resolved by {ticket.resolvedByAdminName}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-neutral-400">
                    No admin response yet. Once an administrator reviews your
                    ticket, their resolution will appear here.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-neutral-800 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}