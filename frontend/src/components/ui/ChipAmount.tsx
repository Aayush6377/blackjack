import { ChipTokenIcon } from "./ChipTokenIcon";

export interface ChipAmountProps {
  amount: number;
  suffix?: string;
  showSuffix?: boolean;
  showPlus?: boolean;
  className?: string;
  iconClassName?: string;
}

export function ChipAmount({
  amount,
  suffix,
  showSuffix = false,
  showPlus = false,
  className = "",
  iconClassName = "h-3.5 w-3.5 shrink-0 text-amber-400",
}: ChipAmountProps) {
  const absFormatted = Math.abs(amount).toLocaleString("en-IN");
  const signPrefix =
    amount < 0 ? "-" : showPlus && amount > 0 ? "+" : "";

  const resolvedSuffix =
    suffix !== undefined
      ? suffix
      : showSuffix
        ? Math.abs(amount) === 1
          ? "Chip"
          : "Chips"
        : "";

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {signPrefix}
      <ChipTokenIcon className={iconClassName} />
      <span className="tabular-nums">
        {absFormatted}
      </span>
      {resolvedSuffix && (
        <span className="text-[0.88em] font-medium opacity-80">
          {resolvedSuffix}
        </span>
      )}
    </span>
  );
}