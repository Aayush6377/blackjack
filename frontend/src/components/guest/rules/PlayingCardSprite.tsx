interface PlayingCardSpriteProps {
  code: string;
  alt?: string;
  caption?: string;
  tiltDeg?: number;
  className?: string;
}

export function PlayingCardSprite({
  code,
  alt,
  caption,
  tiltDeg = 0,
  className = "",
}: PlayingCardSpriteProps) {
  const normalizedCode = code.toUpperCase();

  return (
    <figure className="inline-flex flex-col items-center gap-1.5">
      <div
        style={{ transform: `rotate(${tiltDeg}deg)` }}
        className={`group relative overflow-hidden rounded-xl border border-amber-400/25 bg-neutral-900 shadow-lg shadow-black/60 transition duration-200 hover:-translate-y-1.5 hover:border-amber-400/60 ${className}`}
      >
        <img
          src={`/cards/${normalizedCode}.png`}
          alt={alt ?? `Playing card ${normalizedCode}`}
          loading="lazy"
          className="h-24 w-16 object-cover sm:h-28 sm:w-20"
        />
      </div>
      {caption && (
        <figcaption className="font-mono text-[11px] font-medium text-neutral-300">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}