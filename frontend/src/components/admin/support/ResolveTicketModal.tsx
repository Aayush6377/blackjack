import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2, X } from "lucide-react";
import type {
  ResolveSupportTicketRequest,
  SupportTicketResponse,
  TicketStatus,
} from "../../../types/support";
import { AdminTicketStatusBadge, formatTicketCategory } from "./AdminTicketStatusBadge";

interface ResolveTicketModalProps {
  ticket: SupportTicketResponse | null;
  onClose: () => void;
  onResolve: (
    ticketId: string,
    payload: ResolveSupportTicketRequest
  ) => Promise<unknown>;
  isSubmitting?: boolean;
}

export function ResolveTicketModal({
  ticket,
  onClose,
  onResolve,
  isSubmitting = false,
}: ResolveTicketModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [status, setStatus] = useState<TicketStatus>("RESOLVED");
  const [adminResolution, setAdminResolution] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticket) return;
    setError(null);
    setStatus(
      ticket.status === "OPEN" ? "RESOLVED" : ticket.status
    );
    setAdminResolution(ticket.adminResolution ?? "");
  }, [ticket]);

  useEffect(() => {
    if (!ticket) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ticket, isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setError(null);

    const trimmed = adminResolution.trim();
    if (!trimmed) {
      setError("Please provide a resolution response for the user.");
      return;
    }

    try {
      await onResolve(ticket.id, {
        status,
        adminResolution: trimmed,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update support ticket."
      );
    }
  };

  return (
    <AnimatePresence>
      {ticket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolve-ticket-modal-title"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !isSubmitting && onClose()}
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
            className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-amber-500/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminTicketStatusBadge status={ticket.status} />
                  <span className="rounded-full border border-neutral-800 bg-neutral-950/80 px-2.5 py-0.5 text-[11px] text-neutral-300">
                    {formatTicketCategory(ticket.category)}
                  </span>
                </div>
                <h2
                  id="resolve-ticket-modal-title"
                  className="mt-2 text-lg font-bold text-slate-100"
                >
                  {ticket.subject}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-400">
                  From <span className="text-slate-200">{ticket.userName}</span>{" "}
                  ({ticket.userEmail})
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/75 p-3.5 text-xs leading-relaxed text-neutral-200 sm:text-sm">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                User Query
              </div>
              <p className="whitespace-pre-wrap">{ticket.message}</p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3.5 py-2.5 text-xs font-medium text-rose-200"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  Ticket Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2 text-sm text-slate-100 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 focus:outline-none"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="OPEN">Open</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-300">
                  Admin Resolution *
                </label>
                <textarea
                  rows={4}
                  value={adminResolution}
                  onChange={(e) => setAdminResolution(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Write your response or resolution notes for the user..."
                  className="w-full resize-y rounded-xl border border-neutral-700/80 bg-neutral-950/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder-neutral-500 focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/30 focus:outline-none"
                />
              </div>

              <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Resolution</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}