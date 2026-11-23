export interface RoomBasicDetailsValue {
  name: string;
  slug: string;
  difficulty: string;
  description: string;
  active: boolean;
  displayOrder: string;
}

export interface RoomBasicDetailsSectionProps {
  value: RoomBasicDetailsValue;
  onChange: (next: RoomBasicDetailsValue) => void;
  disabled?: boolean;
}

const DIFFICULTY_OPTIONS = [
  "BEGINNER",
  "CASUAL",
  "INTERMEDIATE",
  "HIGH_ROLLER",
  "VIP",
] as const;

export function RoomBasicDetailsSection({ value, onChange, disabled = false }: RoomBasicDetailsSectionProps) {
  const update = <K extends keyof RoomBasicDetailsValue>(
    key: K,
    val: RoomBasicDetailsValue[K]
  ) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
          Basic Details
        </h2>
        <p className="mt-0.5 text-xs text-neutral-400">
          Room identity, slug, difficulty tier, and visibility settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Room Name *
          </label>
          <input
            type="text"
            required
            value={value.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={disabled}
            placeholder="Velvet Lounge"
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-600 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Slug (kebab-case) *
          </label>
          <input
            type="text"
            required
            value={value.slug}
            onChange={(e) => update("slug", e.target.value)}
            disabled={disabled}
            placeholder="velvet-lounge"
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 placeholder:text-neutral-600 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Difficulty *
          </label>
          <select
            value={value.difficulty}
            onChange={(e) => update("difficulty", e.target.value)}
            disabled={disabled}
            className="w-full cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          >
            {DIFFICULTY_OPTIONS.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-300">
            Display Order
          </label>
          <input
            type="number"
            min={0}
            value={value.displayOrder}
            onChange={(e) => update("displayOrder", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm text-slate-100 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div className="flex items-end sm:col-span-2">
          <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-2.5">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Active Room
              </div>
              <div className="text-[11px] text-neutral-400">
                Inactive rooms remain visible to admins but hidden from active
                play.
              </div>
            </div>
            <input
              type="checkbox"
              checked={value.active}
              onChange={(e) => update("active", e.target.checked)}
              disabled={disabled}
              className="h-4 w-4 cursor-pointer accent-amber-400"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-300">
          Description
        </label>
        <textarea
          rows={3}
          value={value.description}
          onChange={(e) => update("description", e.target.value)}
          disabled={disabled}
          placeholder="Describe table rules, atmosphere, and progression style..."
          className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-600 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
        />
      </div>
    </section>
  );
}