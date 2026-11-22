import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

interface ReplayPlaybackBarProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  muted: boolean;
  onTogglePlay: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSelectStep: (step: number) => void;
  onChangeSpeed: (ms: number) => void;
  onToggleMute: () => void;
}

const SPEED_OPTIONS = [
  { label: "0.75x", ms: 1400 },
  { label: "1x", ms: 950 },
  { label: "1.5x", ms: 600 },
];

export function ReplayPlaybackBar({
  currentStep,
  totalSteps,
  isPlaying,
  speedMs,
  muted,
  onTogglePlay,
  onStepBack,
  onStepForward,
  onReset,
  onSelectStep,
  onChangeSpeed,
  onToggleMute,
}: ReplayPlaybackBarProps) {
  const progressPercent =
    totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-zinc-950/90 p-3.5 sm:p-4 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Transport Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2 text-xs font-extrabold text-zinc-950 shadow-md shadow-amber-400/20 transition hover:brightness-105 active:scale-[0.98]"
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{currentStep >= totalSteps ? "Replay Again" : "Play"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={currentStep <= 0}
            onClick={onStepBack}
            title="Previous Action"
            aria-label="Previous Action"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/45 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={currentStep >= totalSteps}
            onClick={onStepForward}
            title="Next Action"
            aria-label="Next Action"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-amber-400/45 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Restart from Start"
            aria-label="Restart from Start"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-amber-400/45 hover:text-amber-300"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Speed + Mute + Step Counter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900 p-0.5">
            {SPEED_OPTIONS.map((opt) => {
              const active = speedMs === opt.ms;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onChangeSpeed(opt.ms)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    active
                      ? "bg-amber-400 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            title={muted ? "Unmute sound effects" : "Mute sound effects"}
            aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/45 hover:text-amber-200"
          >
            {muted ? (
              <>
                <VolumeX className="h-4 w-4 text-rose-400" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            )}
          </button>

          <span className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-bold text-amber-300">
            Step {currentStep} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps, 1)}
          value={currentStep}
          onChange={(e) => onSelectStep(Number(e.target.value))}
          aria-label="Replay step progress"
          className="h-1.5 w-full cursor-pointer accent-amber-400"
        />
        <span className="w-10 text-right font-mono text-[11px] text-zinc-400">
          {progressPercent}%
        </span>
      </div>
    </div>
  );
}