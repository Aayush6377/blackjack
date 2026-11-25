export function paiseToRupees(paise: number): number {
  if (!Number.isFinite(paise)) return 0;
  return paise / 100;
}

function trimTrailingZero(num: number): string {
  return Number.isInteger(num)
    ? num.toString()
    : num.toFixed(2).replace(/\.?0+$/, "");
}

export function formatRupeesFromPaise(
  paise: number,
  options: { compact?: boolean } = {}
): string {
  const rupees = paiseToRupees(paise);
  const absRupees = Math.abs(rupees);
  const sign = rupees < 0 ? "-" : "";

  if (options.compact !== false) {
    if (absRupees >= 1_00_00_000) {
      const crores = absRupees / 1_00_00_000;
      return `${sign}₹${trimTrailingZero(crores)} Crore`;
    }
    if (absRupees >= 1_00_000) {
      const lakhs = absRupees / 1_00_000;
      return `${sign}₹${trimTrailingZero(lakhs)} Lakh`;
    }
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatRupeeValue(
  rupees: number,
  options: { compact?: boolean } = {}
): string {
  return formatRupeesFromPaise(rupees * 100, options);
}