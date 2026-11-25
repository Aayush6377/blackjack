import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useCurrentProfile, useUpdateProfile } from "../../hooks/useProfile";
import { BlackjackErrorState } from "../ui/BlackjackErrorState";
import { ConfirmModal } from "../ui/ConfirmModal";
import { RoomMediaPickerModal, type MediaSelectionDraft } from "../ui/RoomMediaPickerModal";
import { ProfileOverviewCard } from "./ProfileOverviewCard";
import { ProfileSecurityModals } from "./ProfileSecurityModals";

export function ProfileContent() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useCurrentProfile();

  const updateProfileMutation = useUpdateProfile();

  const [mediaDraft, setMediaDraft] = useState<MediaSelectionDraft | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passwordWarningOpen, setPasswordWarningOpen] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);

  const handleSaveProfile = async ({
    name,
    mediaDraft: draft,
    removeImage,
  }: {
    name: string;
    mediaDraft: MediaSelectionDraft | null;
    removeImage: boolean;
  }) => {
    const activeDraft = draft ?? mediaDraft;

    await updateProfileMutation.mutateAsync({
      name,
      removeImage,
      avatar:
        !removeImage && activeDraft?.mode === "file" ? activeDraft.file : null,
      profileImageUrl:
        !removeImage && activeDraft?.mode === "url" ? activeDraft.url : undefined,
    });

    setMediaDraft(null);
    toast.success("Profile updated successfully.");
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLogoutConfirmOpen(false);
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAccountDeleted = async (message?: string) => {
    toast.success(
      message ||
        "Account deletion started. Your data is being cleaned up in the background."
    );
    await logout();
    navigate("/login", { replace: true });
  };

  if (isLoading && !profile) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-64 animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/75" />
        <div className="h-36 animate-pulse rounded-2xl border border-neutral-800/90 bg-neutral-900/75" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[55vh] w-full flex-1 items-center justify-center">
        <BlackjackErrorState
          title="Unable to load profile"
          message={
            error instanceof Error
              ? error.message
              : "There was a problem fetching your profile details."
          }
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <ProfileOverviewCard
        profile={profile}
        mediaDraft={mediaDraft}
        isSaving={updateProfileMutation.isPending}
        isLoggingOut={isLoggingOut}
        onSaveProfile={handleSaveProfile}
        onOpenMediaPicker={() => setIsMediaPickerOpen(true)}
        onClearMediaDraft={() => setMediaDraft(null)}
        onRequestLogout={() => setIsLogoutConfirmOpen(true)}
      />

      {/* Security & Account Actions Card */}
      <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
              Security &amp; Account Controls
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-100">
              Password &amp; Account Deletion
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Both actions send a 6-character OTP to{" "}
              <span className="font-mono text-slate-200">{profile.email}</span>{" "}
              after warning confirmation.
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-rose-300/90">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span>
                Deleting your account permanently removes chips and game data in
                the background with no tokens or chips issued afterwards.
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPasswordWarningOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Change Password</span>
            </button>

            <button
              type="button"
              onClick={() => setDeleteWarningOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-600/15 px-4 py-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-600/25"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </section>

      <RoomMediaPickerModal
        open={isMediaPickerOpen}
        label="Profile Avatar"
        initialUrl={
          mediaDraft?.mode === "url" ? mediaDraft.url : profile.profileImageUrl
        }
        initialFile={mediaDraft?.mode === "file" ? mediaDraft.file : null}
        onClose={() => setIsMediaPickerOpen(false)}
        onConfirm={(selection) => {
          setMediaDraft(selection);
          toast.info(
            "Avatar selected. Click Save Changes to update your profile."
          );
        }}
      />

      <ConfirmModal
        open={isLogoutConfirmOpen}
        onClose={() => !isLoggingOut && setIsLogoutConfirmOpen(false)}
        onConfirm={() => void handleConfirmLogout()}
        title="Log out of your account?"
        description="Your current session tokens will be cleared and you will be returned to the sign-in screen."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        isLoading={isLoggingOut}
        disableBackdropClose={isLoggingOut}
      />

      <ProfileSecurityModals
        email={profile.email}
        passwordWarningOpen={passwordWarningOpen}
        onClosePasswordWarning={() => setPasswordWarningOpen(false)}
        deleteWarningOpen={deleteWarningOpen}
        onCloseDeleteWarning={() => setDeleteWarningOpen(false)}
        onAccountDeleted={handleAccountDeleted}
      />
    </div>
  );
}