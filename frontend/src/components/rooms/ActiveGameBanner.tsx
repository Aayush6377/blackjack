import type { GameStateSnapshot } from "../../types/game";
import { ChipAmount } from "../ui/ChipAmount";

interface ActiveGameBannerProps {
  activeGame: GameStateSnapshot;
  isLeaving: boolean;
  onResumeRoom: (roomId: string, roundId: string) => void;
  onLeaveGame: (gameId: string) => void;
}

export function ActiveGameBanner({
  activeGame,
  isLeaving,
  onResumeRoom,
  onLeaveGame,
}: ActiveGameBannerProps) {
  const canLeaveDirectly = activeGame.roundStatus !== "IN_PROGRESS";

  return (
    <div className="mb-6 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 via-emerald-950/70 to-zinc-950/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Active Table Session
            </span>
            <span className="rounded-md bg-zinc-900/80 px-2 py-0.5 text-xs font-medium text-zinc-300">
              {activeGame.roomName}
            </span>
            <span className="rounded-md bg-zinc-900/80 px-2 py-0.5 text-xs font-mono text-zinc-400">
              {activeGame.roundStatus}
            </span>
          </div>
          <p className="text-sm text-zinc-200">
            Total Bet:{" "}
            <ChipAmount
              amount={activeGame.totalBet}
              className="font-semibold text-amber-300"
            /> · Hands:{" "}
            <span className="font-semibold text-white">{activeGame.hands.length}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onResumeRoom(activeGame.roomSlug, activeGame.roundId)}
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 cursor-pointer"
          >
            Enter Active Room
          </button>

          {canLeaveDirectly && (
            <button
              type="button"
              disabled={isLeaving}
              onClick={() => onLeaveGame(activeGame.roundId)}
              className="rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-sm font-medium text-zinc-200 transition hover:border-rose-400/50 hover:text-rose-200 disabled:opacity-50 cursor-pointer"
            >
              {isLeaving ? "Leaving..." : "Leave Table"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}