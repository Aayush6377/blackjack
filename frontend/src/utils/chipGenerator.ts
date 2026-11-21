export interface CasinoChipDenom {
  value: number;
  label: string;
  ringClass: string;
  faceClass: string;
  accentClass: string;
}

const CHIP_PALETTES = [
  {
    ringClass: "border-sky-400/90",
    faceClass: "from-sky-600 via-sky-700 to-sky-900 text-white",
    accentClass: "bg-sky-300/20 border-sky-200/50",
  },
  {
    ringClass: "border-rose-400/90",
    faceClass: "from-rose-600 via-rose-700 to-rose-900 text-white",
    accentClass: "bg-rose-300/20 border-rose-200/50",
  },
  {
    ringClass: "border-emerald-400/90",
    faceClass: "from-emerald-600 via-emerald-700 to-emerald-900 text-white",
    accentClass: "bg-emerald-300/20 border-emerald-200/50",
  },
  {
    ringClass: "border-amber-300",
    faceClass: "from-amber-500 via-amber-600 to-amber-800 text-zinc-950",
    accentClass: "bg-amber-100/30 border-amber-100/70",
  },
  {
    ringClass: "border-purple-400/90",
    faceClass: "from-purple-600 via-purple-700 to-purple-950 text-white",
    accentClass: "bg-purple-300/20 border-purple-200/50",
  },
  {
    ringClass: "border-zinc-200",
    faceClass: "from-zinc-700 via-zinc-800 to-zinc-950 text-amber-300",
    accentClass: "bg-amber-400/20 border-amber-300/60",
  },
];

const STANDARD_STEPS = [
  1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000,
];

export function formatChipLabel(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `${Number.isInteger(lakhs) ? lakhs : lakhs.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return String(amount);
}

export function generateRoomChips(
  minBet: number,
  maxBet: number,
  maxAllowed?: number
): CasinoChipDenom[] {
  const safeMin = Math.max(1, Math.floor(minBet));
  const safeMax = Math.max(safeMin, Math.floor(maxBet));
  const ceiling =
    typeof maxAllowed === "number" && maxAllowed > 0
      ? Math.min(safeMax, Math.floor(maxAllowed))
      : safeMax;

  const candidates = STANDARD_STEPS.filter(
    (step) => step >= safeMin && step <= safeMax
  );

  let chosen: number[] = [];

  if (candidates.length >= 4) {
    const indices = new Set<number>([0, candidates.length - 1]);
    while (indices.size < Math.min(5, candidates.length)) {
      const nextIdx = Math.floor(
        ((indices.size - 1) * (candidates.length - 1)) / 4
      );
      indices.add(Math.min(candidates.length - 1, Math.max(0, nextIdx)));
    }
    chosen = Array.from(indices)
      .sort((a, b) => a - b)
      .map((i) => candidates[i]);
  } else {
    const rawSet = new Set<number>([safeMin, ...candidates]);
    const span = safeMax - safeMin;
    if (span > 0) {
      for (const ratio of [0.25, 0.5, 0.75]) {
        const rounded = Math.max(
          safeMin,
          Math.min(safeMax, Math.round((safeMin + span * ratio) / safeMin) * safeMin)
        );
        rawSet.add(rounded);
      }
    }
    rawSet.add(safeMax);
    chosen = Array.from(rawSet)
      .sort((a, b) => a - b)
      .slice(0, 5);
  }

  return chosen.map((value, idx) => {
    const palette = CHIP_PALETTES[idx % CHIP_PALETTES.length];
    return {
      value,
      label: formatChipLabel(value),
      ringClass: palette.ringClass,
      faceClass: palette.faceClass,
      accentClass: palette.accentClass,
    };
  });
}

export function buildVisualChipStack(
  amount: number,
  denoms: CasinoChipDenom[],
  maxVisualChips = 10
): CasinoChipDenom[] {
  if (amount <= 0 || denoms.length === 0) return [];

  const descending = [...denoms].sort((a, b) => b.value - a.value);
  let remaining = amount;
  const stack: CasinoChipDenom[] = [];

  for (const denom of descending) {
    while (remaining >= denom.value && stack.length < maxVisualChips) {
      stack.push(denom);
      remaining -= denom.value;
    }
  }

  if (stack.length === 0) {
    stack.push(descending[descending.length - 1]);
  }

  return stack;
}