import type { RoomSummary } from "../../types/room";
import { ChipAmount } from "../ui/ChipAmount";
import { ChipTokenIcon } from "../ui/ChipTokenIcon";

interface RoomCardProps {
  room: RoomSummary;
  onEnterRoom: (room: RoomSummary) => void;
  onInspectRules: (room: RoomSummary) => void;
}

export function RoomCard({ room, onEnterRoom, onInspectRules }: RoomCardProps) {
  const isLocked = !room.unlocked;
  const canEnter = room.unlocked && room.eligibleToPlay;
  const coverImage = room.thumbnailUrl || room.backgroundUrl;

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition duration-200 ${
        isLocked
          ? "border-zinc-800/90 bg-zinc-950/80"
          : "border-amber-500/20 bg-zinc-950/90 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/5"
      }`}
    >
      {/* Top Banner / Artwork */}
      <div>
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950">
          {coverImage ? (
            <img
              src={coverImage}
              alt={room.name}
              className={`h-full w-full object-cover transition duration-300 ${
                isLocked
                  ? "scale-100 opacity-35 grayscale"
                  : "opacity-75 group-hover:scale-105 group-hover:opacity-90"
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_65%)]">
              <span className="font-serif text-3xl font-bold tracking-widest text-amber-400/30">
                21
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />

          {/* Badges */}
          <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
            <span className="rounded-full border border-amber-400/30 bg-zinc-950/80 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-sm">
              {room.difficulty}
            </span>
            <span className="rounded-full border border-zinc-700/80 bg-zinc-950/80 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              {room.rules.blackjackPayout}
            </span>
          </div>

          <div className="absolute right-3.5 top-3.5">
            {isLocked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-950/85 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300 backdrop-blur-sm">
                🔒 Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-950/85 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 backdrop-blur-sm">
                ● Unlocked
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-xl font-bold tracking-tight text-white">{room.name}</h2>
            <p className="font-mono text-[11px] text-zinc-400">{room.slug}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-4 p-4 sm:p-5">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm text-zinc-300">
            {room.description || "Classic Blackjack Royale table with custom shoe and rule configuration."}
          </p>

          {/* Key Rules Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/55 px-3 py-2">
              <span className="text-zinc-400">Bet Range</span>
              <div className="mt-0.5 font-semibold text-white">
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <ChipTokenIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span>
                    {room.rules.minBet.toLocaleString("en-IN")} – {room.rules.maxBet.toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/55 px-3 py-2">
              <span className="text-zinc-400">Min Wallet</span>
              <div className="mt-0.5 font-semibold text-amber-300">
                <ChipAmount amount={room.rules.minWallet} suffix="" />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/55 px-3 py-2">
              <span className="text-zinc-400">Shoe / Dealer</span>
              <div className="mt-0.5 font-semibold text-zinc-200">
                {room.rules.decksPerShoe}D · {room.rules.dealerHitsSoft17 ? "H17" : "S17"}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/55 px-3 py-2">
              <span className="text-zinc-400">Your Record</span>
              <div className="mt-0.5 font-semibold text-emerald-300">
                {room.progress.roundsWon}W / {room.progress.roundsPlayed}P
              </div>
            </div>
          </div>

          {/* Lock / Eligibility Info */}
          {isLocked && room.unlockRequirements.length > 0 && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-3 text-xs">
              <div className="mb-1.5 font-semibold text-rose-200">Unlock Requirements</div>
              <ul className="space-y-1 text-zinc-300">
                {room.unlockRequirements.map((req, idx) => (
                  <li
                    key={`${req.prerequisiteRoomId}-${idx}`}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      {req.met ? "✓" : "•"} {req.prerequisiteRoomName} ({req.requiredWins}W / {req.requiredRounds}P)
                    </span>
                    {req.minimumWallet > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-amber-300/90">
                        <span>Min</span>
                        <ChipAmount
                          amount={req.minimumWallet}
                          suffix=""
                          iconClassName="h-3 w-3 shrink-0 text-amber-400"
                        />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {room.unlocked && !room.eligibleToPlay && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
              <span className="inline-flex flex-wrap items-center gap-1">
                <span>Wallet balance is below required minimum entry (</span>
                <ChipAmount amount={room.rules.minWallet} iconClassName="h-3 w-3 shrink-0 text-amber-400" />
                <span>) or min bet (</span>
                <ChipAmount amount={room.rules.minBet} iconClassName="h-3 w-3 shrink-0 text-amber-400" />
                <span>).</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2.5 border-t border-zinc-800/80 bg-zinc-900/35 px-4 py-3.5 sm:px-5">
        <button
          type="button"
          onClick={() => onInspectRules(room)}
          className="rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-amber-200 cursor-pointer"
        >
          Rules &amp; Details
        </button>

        <button
          type="button"
          disabled={!canEnter}
          onClick={() => onEnterRoom(room)}
          className={`flex-1 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            canEnter
              ? "bg-amber-400 text-zinc-950 hover:bg-amber-300 cursor-pointer"
              : "cursor-not-allowed border border-zinc-800 bg-zinc-900/70 text-zinc-500"
          }`}
        >
          {isLocked
            ? "Locked"
            : !room.eligibleToPlay
              ? "Min Wallet Required"
              : "Enter Room"}
        </button>
      </div>
    </article>
  );
}