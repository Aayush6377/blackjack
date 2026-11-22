import type { HandOutcome, RoundStatus } from "../../types/replay";

export function formatRoundDate(isoString: string | null): string {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatOutcomeLabel(outcome: HandOutcome | null): string {
  if (!outcome) return "Pending";
  switch (outcome) {
    case "BLACKJACK_WIN":
      return "Blackjack Win";
    case "WIN":
      return "Win";
    case "PUSH":
      return "Push";
    case "LOSS":
      return "Loss";
    case "BUST":
      return "Bust";
    case "SURRENDER":
      return "Surrender";
  }
}

export function formatStatusLabel(status: RoundStatus): string {
  switch (status) {
    case "WAITING":
      return "Waiting";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "ABANDONED":
      return "Abandoned";
  }
}

export function RoundStatusBadge({ status }: { status: RoundStatus }) {
  const styles: Record<RoundStatus, string> = {
    COMPLETED:
      "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
    IN_PROGRESS:
      "border-amber-400/40 bg-amber-500/10 text-amber-300",
    WAITING:
      "border-sky-400/35 bg-sky-500/10 text-sky-300",
    CANCELLED:
      "border-zinc-700 bg-zinc-800/80 text-zinc-400",
    ABANDONED:
      "border-rose-500/35 bg-rose-500/10 text-rose-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${styles[status]}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}

export function OutcomeBadge({ outcome }: { outcome: HandOutcome | null }) {
  if (!outcome) {
    return (
      <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
        —
      </span>
    );
  }

  const isPositive = outcome === "WIN" || outcome === "BLACKJACK_WIN";
  const isNeutral = outcome === "PUSH";

  const badgeClass = isPositive
    ? "border-emerald-500/35 bg-emerald-950/50 text-emerald-300"
    : isNeutral
      ? "border-amber-400/30 bg-amber-950/30 text-amber-200"
      : "border-rose-500/35 bg-rose-950/40 text-rose-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
    >
      {formatOutcomeLabel(outcome)}
    </span>
  );
}