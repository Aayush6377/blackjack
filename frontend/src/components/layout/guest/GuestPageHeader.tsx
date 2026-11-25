export interface GuestPageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function GuestPageHeader({
  eyebrow,
  title,
  subtitle,
}: GuestPageHeaderProps) {
  return (
    <div className="mb-8 border-b border-neutral-800/90 pb-6">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300/85 sm:text-xs">
          {eyebrow}
        </span>
      </div>
      <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-neutral-400 sm:text-sm">
        {subtitle}
      </p>
    </div>
  );
}