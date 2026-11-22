import { CheckCircle2, CircleDot, ListOrdered, Trophy } from "lucide-react";
import type {
  ReplayActionItemResponse,
  RoundSummaryResponse,
} from "../../types/replay";
import { formatActionLabel } from "../../utils/replayStateBuilder";
import { ChipAmount } from "../ui/ChipAmount";

interface ReplayActionsSidebarProps {
  round: RoundSummaryResponse;
  actions: ReplayActionItemResponse[];
  currentStep: number;
  isSettled: boolean;
  onSelectActionStep: (stepNumber: number) => void;
}

export function ReplayActionsSidebar({
  round,
  actions,
  currentStep,
  isSettled,
  onSelectActionStep,
}: ReplayActionsSidebarProps) {
  const netPositive = round.netResult > 0;
  const netZero = round.netResult === 0;

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-amber-400/25 bg-zinc-950/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/90 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
            <ListOrdered className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Action Sequence</h2>
            <p className="text-[11px] text-zinc-400">
              Click any action to jump to that move on the table.
            </p>
          </div>
        </div>
        <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
          {actions.length}
        </span>
      </div>

      {/* Initial Start Row (Step 0) */}
      <button
        type="button"
        onClick={() => onSelectActionStep(0)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs transition ${
          currentStep === 0
            ? "border-amber-400/75 bg-amber-500/15 text-amber-200 shadow-md shadow-amber-400/10"
            : "border-zinc-800/80 bg-zinc-900/55 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-bold text-zinc-400">#0</span>
          <span className="font-semibold">Initial Table (Before Deal)</span>
        </div>
        {currentStep === 0 && (
          <CircleDot className="h-4 w-4 shrink-0 text-amber-400" />
        )}
      </button>

      {/* Ordered Sequence Actions */}
      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {actions.map((action, index) => {
          const stepNumber = index + 1;
          const isActiveStep = currentStep === stepNumber;
          const isCompletedStep = currentStep > stepNumber;

          return (
            <button
              key={action.actionId}
              type="button"
              onClick={() => onSelectActionStep(stepNumber)}
              className={`group flex w-full cursor-pointer items-start justify-between gap-2.5 rounded-xl border p-3 text-left transition ${
                isActiveStep
                  ? "border-amber-400 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-zinc-900 shadow-lg shadow-amber-400/10"
                  : isCompletedStep
                    ? "border-emerald-500/25 bg-emerald-950/15 hover:border-amber-400/40"
                    : "border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/85"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold ${
                    isActiveStep
                      ? "bg-amber-400 text-zinc-950"
                      : isCompletedStep
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {action.sequenceNumber}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isActiveStep ? "text-amber-200" : "text-white"
                      }`}
                    >
                      {formatActionLabel(action.actionType)}
                    </span>

                    {action.handNumber != null && (
                      <span className="rounded bg-zinc-800/90 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                        Hand #{action.handNumber}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                    {action.handValue != null && (
                      <span>
                        Total:{" "}
                        <strong className="font-mono text-zinc-200">
                          {action.handValue}
                        </strong>
                      </span>
                    )}
                    {action.handBetAmount != null && (
                      <span className="inline-flex items-center gap-0.5">
                        <span>Bet:</span>
                        <ChipAmount
                          amount={action.handBetAmount}
                          suffix=""
                          iconClassName="h-2.5 w-2.5 shrink-0 text-amber-400"
                        />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {isActiveStep ? (
                  <CircleDot className="h-4 w-4 text-amber-400" />
                ) : isCompletedStep ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400/80" />
                ) : (
                  <span className="font-mono text-[10px] text-zinc-600 group-hover:text-zinc-400">
                    Jump
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Round Result Card (Shown once settled / end of replay) */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/75 p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Round Summary</span>
          </span>
          {round.outcome && (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">
              {round.outcome.replaceAll("_", " ")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2">
            <div className="text-[10px] uppercase text-zinc-500">Total Bet</div>
            <div className="mt-0.5 text-xs font-bold text-white">
              <ChipAmount
                amount={round.totalBet}
                suffix=""
                iconClassName="h-3 w-3 shrink-0 text-amber-400"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2">
            <div className="text-[10px] uppercase text-zinc-500">Payout</div>
            <div className="mt-0.5 text-xs font-bold text-emerald-300">
              <ChipAmount
                amount={isSettled ? round.totalPayout : 0}
                suffix=""
                iconClassName="h-3 w-3 shrink-0 text-emerald-400"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2">
            <div className="text-[10px] uppercase text-zinc-500">Net</div>
            <div
              className={`mt-0.5 text-xs font-extrabold ${
                !isSettled
                  ? "text-zinc-400"
                  : netPositive
                    ? "text-emerald-300"
                    : netZero
                      ? "text-amber-300"
                      : "text-rose-400"
              }`}
            >
              {!isSettled
                ? "—"
                : `${netPositive ? "+" : netZero ? "" : "-"}${Math.abs(round.netResult).toLocaleString("en-IN")}`}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}