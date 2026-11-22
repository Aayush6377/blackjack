import { Calendar, Play, Sparkles, Trophy } from "lucide-react";
import { ChipAmount } from "../ui/ChipAmount";
import {
  formatRoundDate,
  OutcomeBadge,
  RoundStatusBadge,
} from "./RoundStatusBadge";
import type { RoundSummaryResponse } from "../../types/replay";

interface RoundsListViewProps {
  rounds: RoundSummaryResponse[];
  onReplay: (roundId: string) => void;
}

function NetResultText({ netResult }: { netResult: number }) {
  if (netResult > 0) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-emerald-300">
        +
        <ChipAmount
          amount={netResult}
          suffix=""
          iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
        />
      </span>
    );
  }
  if (netResult < 0) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-rose-400">
        -
        <ChipAmount
          amount={Math.abs(netResult)}
          suffix=""
          iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
        />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-zinc-300">
      <ChipAmount
        amount={0}
        suffix=""
        iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
      />
    </span>
  );
}

export function RoundsListView({ rounds, onReplay }: RoundsListViewProps) {
  if (rounds.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/85 p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 text-amber-300">
          <Trophy className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Game Rounds Found</h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-zinc-400">
          Try clearing or adjusting your search query and filters, or head to a table to
          play a new round.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950/85 shadow-2xl shadow-black/60 md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800/90 bg-zinc-900/90 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3.5">Room &amp; Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Outcome</th>
                <th className="px-4 py-3.5 text-right">Total Bet</th>
                <th className="px-4 py-3.5 text-right">Total Payout</th>
                <th className="px-4 py-3.5 text-right">Net Result</th>
                <th className="px-4 py-3.5 text-right">Replay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {rounds.map((round) => {
                const isCompleted = round.status === "COMPLETED";

                return (
                  <tr
                    key={round.roundId}
                    className="transition hover:bg-zinc-900/65"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">
                        {round.roomName}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar className="h-3 w-3 text-amber-400/80" />
                        <span>{formatRoundDate(round.startedAt)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <RoundStatusBadge status={round.status} />
                    </td>

                    <td className="px-4 py-3.5">
                      <OutcomeBadge outcome={round.outcome} />
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-zinc-200">
                      <ChipAmount
                        amount={round.totalBet}
                        suffix=""
                        iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-zinc-200">
                      <ChipAmount
                        amount={round.totalPayout}
                        suffix=""
                        iconClassName="h-3.5 w-3.5 shrink-0 text-amber-400"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <NetResultText netResult={round.netResult} />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {isCompleted ? (
                        <button
                          type="button"
                          onClick={() => onReplay(round.roundId)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-3.5 py-1.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/15 transition hover:brightness-105 active:scale-[0.98]"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Replay</span>
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {rounds.map((round) => {
          const isCompleted = round.status === "COMPLETED";

          return (
            <div
              key={round.roundId}
              className="rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-4 shadow-lg shadow-black/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      {round.roomName}
                    </h3>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {formatRoundDate(round.startedAt)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <RoundStatusBadge status={round.status} />
                  <OutcomeBadge outcome={round.outcome} />
                </div>
              </div>

              <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/75 p-2.5 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Bet
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-zinc-200">
                    <ChipAmount
                      amount={round.totalBet}
                      suffix=""
                      iconClassName="h-3 w-3 shrink-0 text-amber-400"
                    />
                  </div>
                </div>

                <div className="border-x border-zinc-800/80 px-1">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Payout
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-zinc-200">
                    <ChipAmount
                      amount={round.totalPayout}
                      suffix=""
                      iconClassName="h-3 w-3 shrink-0 text-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Net
                  </div>
                  <div className="mt-0.5 text-xs">
                    <NetResultText netResult={round.netResult} />
                  </div>
                </div>
              </div>

              {isCompleted && (
                <button
                  type="button"
                  onClick={() => onReplay(round.roundId)}
                  className="mt-3.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/15 transition hover:brightness-105 active:scale-[0.99]"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Replay Round</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}