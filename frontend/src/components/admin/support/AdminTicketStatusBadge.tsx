import type { TicketCategory, TicketStatus } from "../../../types/support";

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "border-amber-400/35 bg-amber-500/15 text-amber-300",
  IN_PROGRESS: "border-sky-400/35 bg-sky-500/15 text-sky-300",
  RESOLVED: "border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
  CLOSED: "border-neutral-700 bg-neutral-800 text-neutral-300",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  PAYMENT_OR_CHIPS: "Payment & Chips",
  GAMEPLAY_OR_ROOM: "Gameplay & Rooms",
  ACCOUNT: "Account & Security",
  BUG_REPORT: "Bug Report",
  OTHER: "Other Query",
};

export function formatTicketCategory(category: TicketCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

export function AdminTicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        STATUS_STYLES[status]
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}