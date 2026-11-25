export interface AuditActionBadgeProps {
  action: string;
}

function getActionBadgeStyle(action: string): string {
  const normalized = action.trim().toUpperCase();

  if (normalized.startsWith("BULK_DELETE") || normalized.startsWith("DELETE")) {
    return "border-rose-500/35 bg-rose-950/55 text-rose-300";
  }
  if (normalized.startsWith("DEACTIVATE")) {
    return "border-orange-500/35 bg-orange-950/50 text-orange-300";
  }
  if (normalized.startsWith("ACTIVATE")) {
    return "border-teal-500/35 bg-teal-950/50 text-teal-300";
  }
  if (normalized.startsWith("BULK_CREATE") || normalized.startsWith("CREATE")) {
    return "border-emerald-500/35 bg-emerald-950/55 text-emerald-300";
  }
  if (normalized.startsWith("USER_CHIPS")) {
    return "border-sky-500/35 bg-sky-950/55 text-sky-300";
  }
  if (normalized.startsWith("UPDATE") || normalized.startsWith("TOGGLE")) {
    return "border-amber-400/35 bg-amber-500/15 text-amber-300";
  }
  return "border-neutral-700 bg-neutral-800/80 text-neutral-300";
}

export function AuditActionBadge({ action }: AuditActionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide ${getActionBadgeStyle(action)}`}
    >
      {action}
    </span>
  );
}