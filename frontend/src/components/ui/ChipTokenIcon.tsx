export interface ChipTokenIconProps {
  className?: string;
}

export function ChipTokenIcon({
  className = "h-4 w-4 text-amber-400",
}: ChipTokenIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Outer casino chip body */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Edge stripe ticks */}
      <line x1="12" y1="2.6" x2="12" y2="5.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18.6" x2="12" y2="21.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2.6" y1="12" x2="5.4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18.6" y1="12" x2="21.4" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5.35" y1="5.35" x2="7.35" y2="7.35" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="16.65" y1="16.65" x2="18.65" y2="18.65" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="18.65" y1="5.35" x2="16.65" y2="7.35" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="7.35" y1="16.65" x2="5.35" y2="18.65" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      {/* Inner inlay ring */}
      <circle
        cx="12"
        cy="12"
        r="5.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="2.2 1.6"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}