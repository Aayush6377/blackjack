import { useState } from "react";
import type { RoomSummary } from "../../types/room";
import { soundEffects } from "../../utils/soundEffects";
import { ChipAmount } from "../ui/ChipAmount";

interface TableHeaderProps {
  room: RoomSummary;
  isConnected: boolean;
  controllerTab?: boolean;
  isLeaving: boolean;
  onLeaveRoom: () => void;
}

export function TableHeader({
  room,
  isConnected,
  controllerTab = true,
  isLeaving,
  onLeaveRoom,
}: TableHeaderProps) {
  const [muted, setMuted] = useState<boolean>(() => soundEffects.isMuted());

  const handleToggleMute = () => {
    const nextMuted = soundEffects.toggleMute();
    setMuted(nextMuted);
  };

  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-zinc-950/80 px-4 py-3.5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-400/35 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            {room.difficulty}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
              isConnected
                ? "border-emerald-500/35 bg-emerald-950/60 text-emerald-300"
                : "border-rose-500/35 bg-rose-950/60 text-rose-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-rose-400 animate-pulse"
              }`}
            />
            {isConnected ? "Live Table" : "Reconnecting..."}
          </span>

          {!controllerTab && (
            <span className="rounded-full border border-amber-500/35 bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-medium text-amber-200">
              Active in Another Tab
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {room.name}
          </h1>
          <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
            <span>
              Payout {room.rules.blackjackPayout} · {room.rules.decksPerShoe}D ·{" "}
              {room.rules.dealerHitsSoft17 ? "Dealer Hits Soft 17" : "Dealer Stands 17"} · Bet
            </span>
            <ChipAmount
              amount={room.rules.minBet}
              suffix=""
              iconClassName="h-3 w-3 shrink-0 text-amber-400"
            />
            <span>–</span>
            <ChipAmount
              amount={room.rules.maxBet}
              iconClassName="h-3 w-3 shrink-0 text-amber-400"
            />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleToggleMute}
          className="rounded-xl border border-zinc-700/90 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/45 hover:text-amber-200 cursor-pointer"
          title={muted ? "Unmute sound effects" : "Mute sound effects"}
        >
          {muted ? "🔇 Sound Off" : "🔊 Sound On"}
        </button>

        <button
          type="button"
          disabled={isLeaving}
          onClick={onLeaveRoom}
          className="rounded-xl border border-zinc-700/90 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-rose-400/50 hover:text-rose-200 disabled:opacity-50 cursor-pointer"
        >
          {isLeaving ? "Leaving..." : "Leave table"}
        </button>
      </div>
    </header>
  );
}