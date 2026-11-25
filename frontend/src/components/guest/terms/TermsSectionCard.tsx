import type { LucideIcon } from "lucide-react";

export interface TermsSectionCardProps {
  number: string;
  title: string;
  icon: LucideIcon;
  points: string[];
  callout?: string;
}

export function TermsSectionCard({
  number,
  title,
  icon: Icon,
  points,
  callout,
}: TermsSectionCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 shadow-xl shadow-black/25 sm:p-6">
      <div className="mb-3.5 flex items-center gap-3 border-b border-neutral-800/80 pb-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-neutral-950 text-amber-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
            Clause {number}
          </div>
          <h3 className="text-base font-bold text-slate-100 sm:text-lg">
            {title}
          </h3>
        </div>
      </div>

      <ul className="space-y-2.5 text-xs leading-relaxed text-neutral-300 sm:text-sm">
        {points.map((point, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {callout && (
        <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-950/20 px-3.5 py-2.5 text-xs leading-relaxed text-emerald-200">
          {callout}
        </div>
      )}
    </article>
  );
}