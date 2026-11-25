import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import type { MediaSelectionDraft } from "../ui/RoomMediaPickerModal";
import type { UserProfileResponse } from "../../types/profile";

interface ProfileOverviewCardProps {
  profile: UserProfileResponse;
  mediaDraft: MediaSelectionDraft | null;
  isSaving: boolean;
  isLoggingOut: boolean;
  onSaveProfile: (params: {
    name: string;
    mediaDraft: MediaSelectionDraft | null;
    removeImage: boolean;
  }) => Promise<UserProfileResponse | void>;
  onOpenMediaPicker: () => void;
  onClearMediaDraft: () => void;
  onRequestLogout: () => void;
}

function getInitials(name?: string | null, email?: string): string {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function ProfileOverviewCard({
  profile,
  mediaDraft,
  isSaving,
  isLoggingOut,
  onSaveProfile,
  onOpenMediaPicker,
  onClearMediaDraft,
  onRequestLogout,
}: ProfileOverviewCardProps) {
  const { updateUser } = useAuth();
  const [nameInput, setNameInput] = useState(profile.name ?? "");
  const [removeImage, setRemoveImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setNameInput(profile.name ?? "");
    setRemoveImage(false);
    setFormError(null);
  }, [profile.id, profile.name, profile.profileImageUrl]);

  useEffect(() => {
    if (mediaDraft) {
      setRemoveImage(false);
    }
  }, [mediaDraft]);

  const previewUrl = removeImage
    ? null
    : mediaDraft?.previewUrl ?? profile.profileImageUrl ?? null;

  const canRemoveImage = Boolean(profile.profileImageUrl || mediaDraft) && !removeImage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = nameInput.trim();
    if (trimmedName.length < 2) {
      setFormError("Display name must be at least 2 characters.");
      return;
    }

    try {
      const updatedProfile = await onSaveProfile({
        name: trimmedName,
        mediaDraft,
        removeImage,
      });

      const resolvedImageUrl = updatedProfile
        ? updatedProfile.profileImageUrl ?? null
        : removeImage
          ? null
          : mediaDraft?.previewUrl ?? profile.profileImageUrl ?? null;

      updateUser({
        name: updatedProfile?.name ?? trimmedName,
        avatarUrl: resolvedImageUrl,
      });

      setRemoveImage(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    }
  };

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-gradient-to-b from-neutral-900/95 via-neutral-900/85 to-neutral-950/95 p-5 shadow-xl shadow-black/40 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800/90 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
            Account Identity
          </div>
          <h2 className="mt-1 text-lg font-bold text-slate-100">
            Profile Information
          </h2>
          <p className="text-xs text-neutral-400">
            Update your display name or choose an avatar via URL or file upload.
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestLogout}
          disabled={isLoggingOut || isSaving}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-800/75 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-400/45 hover:bg-neutral-800 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>Logout</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Top Identity Band: Circular Avatar + Controls on Left, Player Summary on Right */}
        <div className="flex flex-col gap-5 rounded-2xl border border-neutral-800/80 bg-neutral-950/55 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-col items-center self-center sm:self-start">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={nameInput || profile.email}
                className="h-24 w-24 rounded-full border-2 border-amber-400/45 object-cover shadow-lg shadow-black/60 ring-4 ring-amber-400/10"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-amber-400/45 bg-gradient-to-br from-amber-500/20 to-emerald-500/10 font-mono text-2xl font-extrabold text-amber-300 shadow-lg shadow-black/60 ring-4 ring-amber-400/10">
                {getInitials(nameInput, profile.email)}
              </div>
            )}

            <div className="mt-2.5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenMediaPicker}
                disabled={isSaving}
                title="Change avatar"
                aria-label="Change avatar"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-amber-400/35 bg-amber-500/10 text-amber-300 transition hover:border-amber-400/60 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>

              {canRemoveImage && (
                <button
                  type="button"
                  onClick={() => {
                    onClearMediaDraft();
                    setRemoveImage(true);
                  }}
                  disabled={isSaving}
                  title="Remove avatar"
                  aria-label="Remove avatar"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-900 text-neutral-300 transition hover:border-rose-500/45 hover:bg-rose-950/40 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h3 className="truncate text-base font-bold text-white sm:text-lg">
                {nameInput.trim() || "Player"}
              </h3>
              {profile.emailVerified && (
                <span
                  title="Verified email"
                  aria-label="Verified email"
                  className="text-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <p className="truncate font-mono text-xs text-neutral-400">
              {profile.email}
            </p>

            {mediaDraft && !removeImage && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                <span>
                  New {mediaDraft.mode === "file" ? "file" : "URL"} ready — save changes to apply.
                </span>
              </div>
            )}

            {removeImage && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/35 px-2.5 py-1 text-[11px] text-rose-200">
                <span>Avatar will be removed when you save changes.</span>
              </div>
            )}
          </div>
        </div>

        {/* Editable & Read-only Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-display-name"
              className="mb-1.5 block text-xs font-medium text-neutral-300"
            >
              Display Name *
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (formError) setFormError(null);
              }}
              disabled={isSaving}
              placeholder="Your name"
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-neutral-500 transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="profile-email-readonly"
              className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-neutral-300"
            >
              <span>Email Address</span>
              {profile.emailVerified && (
                <CheckCircle2
                  aria-label="Verified email"
                  className="h-3.5 w-3.5 text-emerald-400"
                />
              )}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="profile-email-readonly"
                type="email"
                readOnly
                value={profile.email}
                className="w-full cursor-not-allowed rounded-xl border border-neutral-800/90 bg-neutral-950/50 py-2.5 pr-3.5 pl-10 font-mono text-sm text-neutral-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-3.5 py-2.5 text-xs font-medium text-rose-200"
          >
            {formError}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:from-amber-400 hover:to-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </section>
  );
}