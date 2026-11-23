import { Coins, ImageOff, Layers, Loader2, Lock, Pencil, Power, Sparkles, Trash2 } from "lucide-react";
import type { AdminGameRoom } from "../../../types/room";

export interface AdminRoomCardProps {
  room: AdminGameRoom;
  onEdit: (roomId: string) => void;
  onDelete: (room: AdminGameRoom) => void;
  onToggleActive: (room: AdminGameRoom) => void;
  isDeleting?: boolean;
  isTogglingActive?: boolean;
}

export function AdminRoomCard({
  room,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting = false,
  isTogglingActive = false,
}: AdminRoomCardProps) {
  const previewSrc = room.thumbnailUrl || room.backgroundUrl;
  const reshufflePercent = Math.round(room.rules.reshuffleThreshold * 100);
  const busy = isDeleting || isTogglingActive;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900/90 shadow-lg shadow-black/40 transition hover:border-amber-400/45">
      <div>
        {/* Media Banner */}
        <div className="relative h-36 w-full overflow-hidden border-b border-neutral-800 bg-neutral-950">
          {previewSrc ? (
            <img
              src={previewSrc}
              alt={room.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-emerald-950/50 via-neutral-950 to-neutral-900 text-neutral-500">
              <ImageOff className="mb-1 h-5 w-5 text-neutral-600" />
              <span className="text-[11px]">No room image</span>
            </div>
          )}

          {/* Top Overlay Badges */}
          <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
            <span className="rounded-full border border-neutral-700/80 bg-neutral-950/85 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-300 backdrop-blur-sm">
              #{room.displayOrder} • {room.difficulty}
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm ${
                room.active
                  ? "border-emerald-500/40 bg-emerald-950/85 text-emerald-300"
                  : "border-neutral-700 bg-neutral-900/90 text-neutral-400"
              }`}
            >
              {room.active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">
              {room.name}
            </h2>
            <p className="font-mono text-xs text-neutral-400">/{room.slug}</p>
            {room.description && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-300">
                {room.description}
              </p>
            )}
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-2.5">
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>Bet Range</span>
              </div>
              <div className="mt-1 font-mono font-semibold text-slate-100">
                {room.rules.minBet.toLocaleString("en-IN")} –{" "}
                {room.rules.maxBet.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-2.5">
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Min Wallet</span>
              </div>
              <div className="mt-1 font-mono font-semibold text-slate-100">
                {room.rules.minWallet.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-2.5">
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span>Shoe &amp; Cut</span>
              </div>
              <div className="mt-1 font-mono font-semibold text-slate-100">
                {room.rules.decksPerShoe} decks • {reshufflePercent}%
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/90 bg-neutral-950/70 p-2.5">
              <div className="text-[11px] text-neutral-400">Payout &amp; S17</div>
              <div className="mt-1 font-mono font-semibold text-amber-300">
                {room.rules.blackjackPayout} •{" "}
                {room.rules.dealerHitsSoft17 ? "H17" : "S17"}
              </div>
            </div>
          </div>

          {/* Unlock Rules Summary */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Unlock Rules ({room.unlockRules.length})</span>
            </div>

            {room.unlockRules.length === 0 ? (
              <p className="mt-1 text-xs text-neutral-500">
                Open room (no prerequisites)
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {room.unlockRules.map((rule) => (
                  <span
                    key={rule.id}
                    className="rounded-lg border border-amber-500/20 bg-neutral-900 px-2 py-1 font-mono text-[11px] text-amber-200"
                  >
                    {rule.prerequisiteRoomName}: {rule.requiredRounds}r /{" "}
                    {rule.requiredWins}w
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-800/90 bg-neutral-950/50 px-5 py-3.5">
        <button
          type="button"
          onClick={() => onToggleActive(room)}
          disabled={busy}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            room.active
              ? "border-neutral-700/80 bg-neutral-800/80 text-neutral-300 hover:border-amber-400/40 hover:text-amber-200"
              : "border-emerald-500/35 bg-emerald-950/35 text-emerald-300 hover:bg-emerald-950/60"
          }`}
        >
          {isTogglingActive ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Power className="h-3.5 w-3.5" />
          )}
          <span>{room.active ? "Deactivate" : "Activate"}</span>
        </button>

        <button
          type="button"
          onClick={() => onEdit(room.id)}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/45 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(room)}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3.5 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-950/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}