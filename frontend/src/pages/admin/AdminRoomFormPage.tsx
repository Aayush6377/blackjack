import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import type { CreateRoomUnlockRulePayload } from "../../types/room";
import { RoomMediaSection, type RoomMediaFieldState } from "../../components/admin/rooms/RoomMediaSection";
import { useAdminRoom, useAdminRooms, useCreateAdminRoom, useCreateRoomUnlockRule, useUpdateAdminRoom } from "../../hooks/useRooms";
import { RoomBasicDetailsSection, type RoomBasicDetailsValue } from "../../components/admin/rooms/RoomBasicDetailsSection";
import { RoomGameplayRulesSection, type RoomGameplayRulesValue } from "../../components/admin/rooms/RoomGameplayRulesSection";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { RoomUnlockRulesSection } from "../../components/admin/rooms/RoomUnlockRulesSection";

const EMPTY_MEDIA: RoomMediaFieldState = {
  previewUrl: null,
  url: "",
  file: null,
  cleared: false,
};

function toBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeUniqueSlug(
  rawName: string,
  takenSlugs: Set<string>
): string {
  const base = toBaseSlug(rawName) || "room";
  if (!takenSlugs.has(base)) {
    return base;
  }

  let counter = 2;
  while (takenSlugs.has(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}

export default function AdminRoomFormPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(roomId);

  const { data: allRooms = [] } = useAdminRooms();
  const {
    data: existingRoom,
    isLoading: isLoadingRoom,
    isError: isRoomError,
    refetch,
  } = useAdminRoom(roomId);

  const createRoomMutation = useCreateAdminRoom();
  const updateRoomMutation = useUpdateAdminRoom();
  const createRuleMutation = useCreateRoomUnlockRule();

  const [basic, setBasic] = useState<RoomBasicDetailsValue>({
    name: "",
    slug: "",
    difficulty: "BEGINNER",
    description: "",
    active: true,
    displayOrder: "0",
  });

  const [gameplay, setGameplay] = useState<RoomGameplayRulesValue>({
    minWallet: "100",
    minBet: "10",
    maxBet: "1000",
    decksPerShoe: "6",
    reshuffleThresholdPercent: "75",
    blackjackPayout: "3:2",
    dealerHitsSoft17: true,
  });

  const [thumbnail, setThumbnail] = useState<RoomMediaFieldState>(EMPTY_MEDIA);
  const [background, setBackground] = useState<RoomMediaFieldState>(EMPTY_MEDIA);
  const [draftRules, setDraftRules] = useState<CreateRoomUnlockRulePayload[]>(
    []
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeactivateWarning, setShowDeactivateWarning] = useState(false);

  const hydratedRoomIdRef = useRef<string | null>(null);
  const slugManuallyEditedRef = useRef(false);

  const takenSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRooms) {
      if (isEditMode && r.id === roomId) continue;
      if (r.slug) {
        set.add(r.slug.trim().toLowerCase());
      }
    }
    return set;
  }, [allRooms, isEditMode, roomId]);

  const dependentRoomsSummary = useMemo(() => {
    if (!isEditMode || !roomId) return [];
    const affected: string[] = [];
    for (const room of allRooms) {
      if (room.id === roomId) continue;
      const dependsOnTarget = room.unlockRules.some(
        (rule) => rule.prerequisiteRoomId === roomId
      );
      if (dependsOnTarget) {
        affected.push(room.name);
      }
    }
    return affected;
  }, [allRooms, isEditMode, roomId]);

  useEffect(() => {
    if (!existingRoom) return;
    if (hydratedRoomIdRef.current === existingRoom.id) return;
    hydratedRoomIdRef.current = existingRoom.id;
    slugManuallyEditedRef.current = false;

    setBasic({
      name: existingRoom.name,
      slug: existingRoom.slug,
      difficulty: existingRoom.difficulty,
      description: existingRoom.description ?? "",
      active: existingRoom.active,
      displayOrder: String(existingRoom.displayOrder),
    });
    setGameplay({
      minWallet: String(existingRoom.rules.minWallet),
      minBet: String(existingRoom.rules.minBet),
      maxBet: String(existingRoom.rules.maxBet),
      decksPerShoe: String(existingRoom.rules.decksPerShoe),
      reshuffleThresholdPercent: String(
        Math.round(existingRoom.rules.reshuffleThreshold * 100)
      ),
      blackjackPayout: existingRoom.rules.blackjackPayout,
      dealerHitsSoft17: existingRoom.rules.dealerHitsSoft17,
    });
    setThumbnail({
      previewUrl: existingRoom.thumbnailUrl,
      url: existingRoom.thumbnailUrl ?? "",
      file: null,
      cleared: false,
    });
    setBackground({
      previewUrl: existingRoom.backgroundUrl,
      url: existingRoom.backgroundUrl ?? "",
      file: null,
      cleared: false,
    });
  }, [existingRoom]);

  const handleBasicChange = (next: RoomBasicDetailsValue) => {
    if (next.slug !== basic.slug) {
      slugManuallyEditedRef.current = next.slug.trim().length > 0;
      setBasic(next);
      return;
    }

    if (next.name !== basic.name && !slugManuallyEditedRef.current) {
      const generatedSlug = makeUniqueSlug(next.name, takenSlugs);
      setBasic({ ...next, slug: generatedSlug });
      return;
    }

    setBasic(next);
  };

  const performSave = async () => {
    setFormError(null);

    const minWallet = Number(gameplay.minWallet);
    const minBet = Number(gameplay.minBet);
    const maxBet = Number(gameplay.maxBet);
    const decksPerShoe = Number(gameplay.decksPerShoe);
    const thresholdPercent = Number(gameplay.reshuffleThresholdPercent);
    const displayOrder = Number(basic.displayOrder || "0");

    if (
      !Number.isInteger(thresholdPercent) ||
      thresholdPercent < 1 ||
      thresholdPercent > 99
    ) {
      setFormError(
        "Reshuffle threshold must be a whole number between 1% and 99%."
      );
      return;
    }

    if (maxBet < minBet) {
      setFormError("Maximum bet must be greater than or equal to minimum bet.");
      return;
    }

    const reshuffleThreshold = Number((thresholdPercent / 100).toFixed(2));

    try {
      if (isEditMode && roomId) {
        await updateRoomMutation.mutateAsync({
          roomId,
          payload: {
            name: basic.name.trim(),
            slug: basic.slug.trim(),
            difficulty: basic.difficulty,
            description: basic.description,
            active: basic.active,
            displayOrder,
            minWallet,
            minBet,
            maxBet,
            decksPerShoe,
            reshuffleThreshold,
            blackjackPayout: gameplay.blackjackPayout,
            dealerHitsSoft17: gameplay.dealerHitsSoft17,
            thumbnailFile: thumbnail.file,
            thumbnailUrl: thumbnail.file ? undefined : thumbnail.url,
            clearThumbnail:
              thumbnail.cleared && !thumbnail.file && !thumbnail.url,
            backgroundFile: background.file,
            backgroundUrl: background.file ? undefined : background.url,
            clearBackground:
              background.cleared && !background.file && !background.url,
          },
        });
        toast.success("Game room updated");
        navigate("/admin/rooms");
      } else {
        const created = await createRoomMutation.mutateAsync({
          name: basic.name.trim(),
          slug: basic.slug.trim(),
          difficulty: basic.difficulty,
          description: basic.description || null,
          active: basic.active,
          displayOrder,
          minWallet,
          minBet,
          maxBet,
          decksPerShoe,
          reshuffleThreshold,
          blackjackPayout: gameplay.blackjackPayout,
          dealerHitsSoft17: gameplay.dealerHitsSoft17,
          thumbnailFile: thumbnail.file,
          thumbnailUrl: thumbnail.file ? undefined : thumbnail.url || null,
          backgroundFile: background.file,
          backgroundUrl: background.file ? undefined : background.url || null,
        });

        for (const rule of draftRules) {
          await createRuleMutation.mutateAsync({
            roomId: created.id,
            payload: rule,
          });
        }

        toast.success("Game room created");
        navigate("/admin/rooms");
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save game room."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isTransitioningToInactive =
      isEditMode &&
      Boolean(existingRoom?.active) &&
      !basic.active;

    if (isTransitioningToInactive) {
      setShowDeactivateWarning(true);
      return;
    }

    await performSave();
  };

  const isSubmitting =
    createRoomMutation.isPending ||
    updateRoomMutation.isPending ||
    createRuleMutation.isPending;

  if (isEditMode && isRoomError) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminPageHeader
          title="Edit Game Room"
          subtitle="Update room rules, media assets, and unlock prerequisites."
        />
        <div className="flex min-h-[60vh] flex-1 items-center justify-center">
          <BlackjackErrorState
            title="Unable to load room details"
            message="There was a problem loading the selected game room."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    );
  }

  if (isEditMode && isLoadingRoom) {
    return (
      <div className="flex flex-1 flex-col space-y-6">
        <AdminPageHeader
          title="Edit Game Room"
          subtitle="Loading room configuration..."
        />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/70"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 pb-12">
      <AdminPageHeader
        title={
          isEditMode ? `Edit Room: ${existingRoom?.name ?? ""}` : "Create Game Room"
        }
        subtitle={
          isEditMode
            ? "Update room rules, media assets, and unlock prerequisites."
            : "Configure a new Blackjack room, shoe rules, media, and unlock prerequisites."
        }
        action={
          <button
            type="button"
            onClick={() => navigate("/admin/rooms")}
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Rooms</span>
          </button>
        }
      />

      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-200"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <RoomBasicDetailsSection
          value={basic}
          onChange={handleBasicChange}
          disabled={isSubmitting}
        />

        <RoomGameplayRulesSection
          value={gameplay}
          onChange={setGameplay}
          disabled={isSubmitting}
        />

        <RoomMediaSection
          thumbnail={thumbnail}
          background={background}
          onThumbnailChange={setThumbnail}
          onBackgroundChange={setBackground}
          disabled={isSubmitting}
        />

        <RoomUnlockRulesSection
          currentRoomId={roomId}
          existingRules={existingRoom?.unlockRules ?? []}
          draftRules={draftRules}
          onDraftRulesChange={setDraftRules}
          disabled={isSubmitting}
        />

        <div className="flex flex-col-reverse gap-3 border-t border-neutral-800 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/rooms")}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isEditMode ? "Update Room" : "Create Room"}</span>
          </button>
        </div>
      </form>

      <ConfirmModal
        open={showDeactivateWarning}
        onClose={() => {
          if (!isSubmitting) {
            setShowDeactivateWarning(false);
          }
        }}
        onConfirm={async () => {
          setShowDeactivateWarning(false);
          await performSave();
        }}
        variant="warning"
        title="Deactivate Game Room?"
        description="Saving this room as inactive will automatically remove all unlock rules on other rooms that depend on it as a prerequisite."
        highlightText={
          dependentRoomsSummary.length > 0
            ? `${basic.name || existingRoom?.name || "Room"} — Dependent rooms affected: ${dependentRoomsSummary.join(", ")}`
            : `${basic.name || existingRoom?.name || "Room"} — Any unlock rules referencing this room will be removed.`
        }
        confirmLabel="Save & Remove Dependent Rules"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      />
    </div>
  );
}