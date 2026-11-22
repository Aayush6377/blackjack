import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Film, RefreshCw } from "lucide-react";
import { BlackjackFeltTable } from "../../components/game/BlackjackFeltTable";
import { ReplayActionsSidebar } from "../../components/replay/ReplayActionsSidebar";
import { ReplayBetChipBadge } from "../../components/replay/ReplayBetChipBadge";
import { ReplayPlaybackBar } from "../../components/replay/ReplayPlaybackBar";
import { useRoundReplay } from "../../hooks/useReplays";
import type { CardCode, HandSnapshot } from "../../types/game";
import type { RoomRules } from "../../types/room";
import type { ReplayCard } from "../../types/replay";
import {
  buildReplayStepState,
  formatCardShort,
} from "../../utils/replayStateBuilder";
import { soundEffects } from "../../utils/soundEffects";

function toCardCode(card: ReplayCard): CardCode {
  return formatCardShort(card);
}

export default function RoundReplayPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();

  const { data: replay, isLoading, isError, error, refetch } = useRoundReplay(roundId);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(950);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(() => soundEffects.isMuted());
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);

  const prevStepRef = useRef<number>(0);
  const prevDealerCountRef = useRef<number>(0);
  const prevHandCountsRef = useRef<Record<string, number>>({});

  // Reset playback state when switching rounds
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    setSelectedHandId(null);
    prevStepRef.current = 0;
    prevDealerCountRef.current = 0;
    prevHandCountsRef.current = {};
  }, [roundId]);

  const totalSteps = replay?.actions.length ?? 0;

  // Auto-play timer (enabled by default)
  useEffect(() => {
    if (!isPlaying || !replay || totalSteps === 0) return;

    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }, speedMs);

    return () => window.clearTimeout(timer);
  }, [isPlaying, replay, totalSteps, currentStep, speedMs]);

  const stepState = useMemo(() => {
    if (!replay) return null;
    return buildReplayStepState(replay, currentStep);
  }, [replay, currentStep]);

  // Trigger sound effects when stepping forward
  useEffect(() => {
    if (!stepState || !replay) return;

    const steppedForward = currentStep > prevStepRef.current;
    if (steppedForward && stepState.currentAction) {
      const type = stepState.currentAction.actionType;
      if (
        type === "ROUND_STARTED" ||
        type === "PLAYER_DOUBLE_DOWN" ||
        type === "PLAYER_SPLIT" ||
        type === "INSURANCE_ACCEPTED"
      ) {
        soundEffects.play("chip");
      }
      if (
        type === "ROUND_STARTED" ||
        type === "PLAYER_HIT" ||
        type === "PLAYER_DOUBLE_DOWN" ||
        type === "PLAYER_SPLIT"
      ) {
        soundEffects.play("cardDeal");
      }
    }

    prevStepRef.current = currentStep;
    prevDealerCountRef.current = stepState.dealerCards.length;
    const nextCounts: Record<string, number> = {};
    stepState.hands.forEach((h) => {
      nextCounts[h.handId] = h.cards.length;
    });
    prevHandCountsRef.current = nextCounts;
  }, [stepState, replay, currentStep]);

  const roomRules: RoomRules = useMemo(() => {
    const snap = replay?.round.rulesSnapshot ?? {};
    const minBet =
      typeof snap.minBet === "number" ? snap.minBet : replay?.round.originalBet ?? 10;
    const maxBet =
      typeof snap.maxBet === "number"
        ? snap.maxBet
        : Math.max(100000, (replay?.round.totalBet ?? 1000) * 10);

    return {
      decksPerShoe: typeof snap.decksPerShoe === "number" ? snap.decksPerShoe : 6,
      reshuffleThreshold:
        typeof snap.reshuffleThreshold === "number" ? snap.reshuffleThreshold : 52,
      blackjackPayout:
        typeof snap.blackjackPayout === "string" ? snap.blackjackPayout : "3:2",
      dealerHitsSoft17: Boolean(snap.dealerHitsSoft17),
      minBet,
      maxBet,
      minWallet: typeof snap.minWallet === "number" ? snap.minWallet : 0,
    };
  }, [replay]);

  const mappedDealerCards: CardCode[] = useMemo(() => {
    if (!stepState) return [];
    return stepState.dealerCards.map(toCardCode);
  }, [stepState]);

  const mappedHands: HandSnapshot[] = useMemo(() => {
    if (!stepState) return [];
    return stepState.hands.map((h) => ({
      handId: h.handId,
      handNumber: h.handNumber,
      cards: h.cards.map(toCardCode),
      betAmount: h.betAmount,
      handValue: h.handValue,
      status: h.status,
      outcome: h.outcome,
    }));
  }, [stepState]);

  const handleTogglePlay = useCallback(() => {
    if (!replay || totalSteps === 0) return;
    if (currentStep >= totalSteps) {
      prevStepRef.current = 0;
      setCurrentStep(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [replay, totalSteps, currentStep]);

  const handleStepBack = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const handleStepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  }, [totalSteps]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    prevStepRef.current = 0;
    setCurrentStep(0);
  }, []);

  const handleSelectStep = useCallback(
    (step: number) => {
      setIsPlaying(false);
      setCurrentStep(Math.max(0, Math.min(totalSteps, step)));
    },
    [totalSteps]
  );

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundEffects.toggleMute();
    setMuted(nextMuted);
  }, []);

  return (
    <section className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.16),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Bar */}
        {/* Clean Page Header (Matches Game Rooms & Replays List) */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            <Film className="h-3.5 w-3.5" />
            <span>Blackjack Royale · Round Replay</span>
            {roundId && (
                <span className="rounded-md border border-zinc-800 bg-zinc-900/90 px-2 py-0.5 font-mono text-[11px] font-medium normal-case tracking-normal text-zinc-400">
                #{roundId.slice(0, 8)}
                </span>
            )}
            </div>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            {replay ? replay.round.roomName : "Round Replay"}
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
            Step through every dealer and player move from this completed hand.
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
            type="button"
            onClick={() => navigate("/replays")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/50 hover:bg-amber-500/20"
            >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Replays</span>
            </button>

            <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/45 hover:text-white"
            >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload</span>
            </button>
        </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-[480px] animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/60 lg:col-span-8" />
            <div className="h-[480px] animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/50 lg:col-span-4" />
          </div>
        ) : isError || !replay || !stepState ? (
          <div className="rounded-2xl border border-rose-500/35 bg-rose-950/25 p-8 text-center">
            <p className="text-sm text-rose-200">
              {error?.message || "Unable to load replay data for this round."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/replays")}
              className="mt-4 cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-300"
            >
              Return to Rounds List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left / Main Table & Playback Column */}
            <div className="flex flex-col gap-4 lg:col-span-8">
              <ReplayPlaybackBar
                currentStep={currentStep}
                totalSteps={totalSteps}
                isPlaying={isPlaying}
                speedMs={speedMs}
                muted={muted}
                onTogglePlay={handleTogglePlay}
                onStepBack={handleStepBack}
                onStepForward={handleStepForward}
                onReset={handleReset}
                onSelectStep={handleSelectStep}
                onChangeSpeed={setSpeedMs}
                onToggleMute={handleToggleMute}
              />

              <BlackjackFeltTable
                rules={roomRules}
                dealerCards={
                  stepState.hideHoleCard
                    ? mappedDealerCards.slice(0, 2)
                    : mappedDealerCards
                }
                dealerTotal={stepState.dealerTotal}
                roundStatus={stepState.isSettled ? "COMPLETED" : "IN_PROGRESS"}
                insuranceAvailable={false}
                insuranceStatus={stepState.insuranceStatus}
                originalBet={replay.round.originalBet}
                hands={mappedHands}
                selectedHandId={selectedHandId ?? stepState.activeHandId}
                prevDealerCount={prevDealerCountRef.current}
                prevHandCardCounts={prevHandCountsRef.current}
                isShuffling={isShuffling}
                isSubmitting={false}
                onShuffleComplete={() => setIsShuffling(false)}
                onManualShufflePreview={() => setIsShuffling(true)}
                onDecideInsurance={() => {}}
                onSelectHand={(handId) => setSelectedHandId(handId)}
              />

              <ReplayBetChipBadge
                betAmount={stepState.activeBetAmount}
                minBet={roomRules.minBet}
                maxBet={roomRules.maxBet}
                label={
                  mappedHands.length > 1
                    ? "Active / Latest Hand Bet"
                    : "Round Bet Amount"
                }
              />
            </div>

            {/* Right Sidebar: Sequence Actions List */}
            <div className="lg:col-span-4">
              <ReplayActionsSidebar
                round={replay.round}
                actions={replay.actions}
                currentStep={currentStep}
                isSettled={stepState.isSettled}
                onSelectActionStep={handleSelectStep}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}