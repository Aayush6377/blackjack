import { useEffect } from "react";
import type { RoomSummary } from "../../types/room";
import { ChipAmount } from "../ui/ChipAmount";
import { ChipTokenIcon } from "../ui/ChipTokenIcon";
import { X } from "lucide-react";

interface RoomRulesModalProps {
  room: RoomSummary | null;
  onClose: () => void;
  onEnterRoom: (room: RoomSummary) => void;
}

export function RoomRulesModal({ room, onClose, onEnterRoom }: RoomRulesModalProps) {
  useEffect(() => {
    if (!room) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [room, onClose]);

  if (!room) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-rules-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-amber-500/25 bg-zinc-950 text-zinc-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Artwork */}
        <div className="relative h-44 w-full overflow-hidden border-b border-zinc-800 bg-emerald-950/60">
          {(room.backgroundUrl || room.thumbnailUrl) && (
            <img
              src={room.backgroundUrl || room.thumbnailUrl || ""}
              alt={room.name}
              className="h-full w-full object-cover opacity-55"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3.5 top-3.5 inline-flex cursor-pointer items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900/90 p-1.5 text-zinc-300 transition hover:border-amber-400/50 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-400/35 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  {room.difficulty}
                </span>
                <span className="font-mono text-xs text-zinc-400">#{room.displayOrder} · {room.slug}</span>
              </div>
              <h2 id="room-rules-title" className="mt-1 text-2xl font-bold text-white">
                {room.name}
              </h2>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                room.unlocked
                  ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border border-rose-500/40 bg-rose-500/15 text-rose-300"
              }`}
            >
              {room.unlocked ? "Unlocked" : "Locked"}
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {room.description && (
            <p className="text-sm leading-relaxed text-zinc-300">{room.description}</p>
          )}

          {/* Table Rules Grid */}
          <div>
            <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
              Table &amp; Shoe Rules
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-400">Betting Limits</div>
                <div className="mt-0.5 text-sm font-semibold text-white">
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <ChipTokenIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span>
                      {room.rules.minBet.toLocaleString("en-IN")} – {room.rules.maxBet.toLocaleString("en-IN")}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-400">Min Wallet Entry</div>
                <div className="mt-0.5 text-sm font-semibold text-amber-300">
                  <ChipAmount amount={room.rules.minWallet} />
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-400">Blackjack Payout</div>
                <div className="mt-0.5 text-sm font-semibold text-emerald-300">
                  {room.rules.blackjackPayout}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-400">Shoe Size</div>
                <div className="mt-0.5 text-sm font-semibold text-white">
                  {room.rules.decksPerShoe} {room.rules.decksPerShoe === 1 ? "Deck" : "Decks"}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-400">Dealer Soft 17</div>
                <div className="mt-0.5 text-sm font-semibold text-white">
                  {room.rules.dealerHitsSoft17 ? "Hits Soft 17 (H17)" : "Stands on 17 (S17)"}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-3">
                <div className="text-xs text-zinc-400">Reshuffle Pen</div>
                <div className="mt-0.5 text-sm font-semibold text-white">
                  {Math.round(room.rules.reshuffleThreshold * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Your Progress in This Room */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Your Room Record
            </h3>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div>
                <span className="text-zinc-400">Rounds Played: </span>
                <span className="font-semibold text-white">{room.progress.roundsPlayed}</span>
              </div>
              <div>
                <span className="text-zinc-400">Rounds Won: </span>
                <span className="font-semibold text-emerald-300">{room.progress.roundsWon}</span>
              </div>
              {room.progress.unlockedAt && (
                <div>
                  <span className="text-zinc-400">Unlocked On: </span>
                  <span className="text-zinc-200">
                    {new Date(room.progress.unlockedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Unlock Requirements */}
          {room.unlockRequirements.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400/90">
                Unlock Requirements
              </h3>
              <ul className="space-y-2">
                {room.unlockRequirements.map((req, idx) => (
                  <li
                    key={`${req.prerequisiteRoomId}-${idx}`}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
                      req.met
                        ? "border-emerald-500/30 bg-emerald-950/25 text-emerald-200"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{req.prerequisiteRoomName}</div>
                      <div className="inline-flex flex-wrap items-center gap-1.5 text-zinc-400">
                        <span>Rounds: {req.requiredRounds} · Wins: {req.requiredWins} · Min Wallet:</span>
                        <ChipAmount
                          amount={req.minimumWallet}
                          suffix=""
                          iconClassName="h-3 w-3 shrink-0 text-amber-400"
                        />
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-semibold ${
                        req.met
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {req.met ? "Met" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!room.unlocked || !room.eligibleToPlay}
              onClick={() => onEnterRoom(room)}
              className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 cursor-pointer"
            >
              {!room.unlocked
                ? "Room Locked"
                : !room.eligibleToPlay
                  ? "Insufficient Wallet for Entry"
                  : "Enter Room"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}