import type { ReactNode } from "react";

export interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-neutral-800/90 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/85">
            Admin Console
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-neutral-400">{subtitle}</p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}