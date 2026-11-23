import { useState } from "react";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import {
  RoomMediaPickerModal,
  type MediaSelectionDraft,
} from "./RoomMediaPickerModal";

export interface RoomMediaFieldState {
  previewUrl: string | null;
  url: string;
  file: File | null;
  cleared: boolean;
}

export interface RoomMediaSectionProps {
  thumbnail: RoomMediaFieldState;
  background: RoomMediaFieldState;
  onThumbnailChange: (next: RoomMediaFieldState) => void;
  onBackgroundChange: (next: RoomMediaFieldState) => void;
  disabled?: boolean;
}

interface MediaCardProps {
  title: string;
  description: string;
  state: RoomMediaFieldState;
  onOpenPicker: () => void;
  onClear: () => void;
  disabled?: boolean;
}

function MediaPreviewCard({
  title,
  description,
  state,
  onOpenPicker,
  onClear,
  disabled,
}: MediaCardProps) {
  const hasImage = Boolean(state.previewUrl) && !state.cleared;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/65 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {title}
          </h3>
          <p className="mt-0.5 text-[11px] text-neutral-400">{description}</p>
        </div>
        {state.file && (
          <span className="shrink-0 rounded-md border border-emerald-500/30 bg-emerald-950/50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
            File queued
          </span>
        )}
      </div>

      {hasImage ? (
        <div className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
          <img
            src={state.previewUrl!}
            alt={`${title} preview`}
            className="h-40 w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 text-xs text-neutral-500">
          <ImageIcon className="mb-1.5 h-5 w-5 text-neutral-600" />
          <span>No {title.toLowerCase()} set</span>
        </div>
      )}

      {state.file ? (
        <p className="truncate font-mono text-[11px] text-amber-300/90">
          {state.file.name}
        </p>
      ) : state.url ? (
        <p className="truncate font-mono text-[11px] text-neutral-400">
          {state.url}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onOpenPicker}
          disabled={disabled}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/35 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>{hasImage ? "Change Image" : "Add / Upload Image"}</span>
        </button>

        {hasImage && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-950/55 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function RoomMediaSection({
  thumbnail,
  background,
  onThumbnailChange,
  onBackgroundChange,
  disabled = false,
}: RoomMediaSectionProps) {
  const [activeTarget, setActiveTarget] = useState<
    "thumbnail" | "background" | null
  >(null);

  const handleConfirmSelection = (draft: MediaSelectionDraft) => {
    if (activeTarget === "thumbnail") {
      onThumbnailChange({
        previewUrl: draft.previewUrl,
        url: draft.mode === "url" ? draft.url : "",
        file: draft.mode === "file" ? draft.file : null,
        cleared: false,
      });
    } else if (activeTarget === "background") {
      onBackgroundChange({
        previewUrl: draft.previewUrl,
        url: draft.mode === "url" ? draft.url : "",
        file: draft.mode === "file" ? draft.file : null,
        cleared: false,
      });
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/75 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
          Room Media Assets
        </h2>
        <p className="mt-0.5 text-xs text-neutral-400">
          Choose a direct image URL or upload a file. Nothing is sent to the
          server until you save the room.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MediaPreviewCard
          title="Thumbnail Image"
          description="Shown on room cards and lobby lists."
          state={thumbnail}
          onOpenPicker={() => setActiveTarget("thumbnail")}
          onClear={() =>
            onThumbnailChange({
              previewUrl: null,
              url: "",
              file: null,
              cleared: true,
            })
          }
          disabled={disabled}
        />

        <MediaPreviewCard
          title="Background Image"
          description="Shown behind the active Blackjack table."
          state={background}
          onOpenPicker={() => setActiveTarget("background")}
          onClear={() =>
            onBackgroundChange({
              previewUrl: null,
              url: "",
              file: null,
              cleared: true,
            })
          }
          disabled={disabled}
        />
      </div>

      <RoomMediaPickerModal
        open={activeTarget !== null}
        label={activeTarget === "background" ? "Background Image" : "Thumbnail Image"}
        initialUrl={
          activeTarget === "background" ? background.url : thumbnail.url
        }
        initialFile={
          activeTarget === "background" ? background.file : thumbnail.file
        }
        onClose={() => setActiveTarget(null)}
        onConfirm={handleConfirmSelection}
      />
    </section>
  );
}