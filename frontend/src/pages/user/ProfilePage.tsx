import { RotateCcw } from "lucide-react";
import { ProfileContent } from "../../components/profile/ProfileContent";
import { useCurrentProfile } from "../../hooks/useProfile";

export default function ProfilePage() {
  const { refetch, isFetching } = useCurrentProfile();

  return (
    <section className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%),_#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between gap-3 sm:items-end">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 sm:text-xs">
              Blackjack Royale · Account
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
              Manage your player profile, avatar, password OTP updates, and
              account settings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/55 hover:bg-amber-500/20 sm:px-3.5"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 shrink-0 ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>

        <ProfileContent />
      </div>
    </section>
  );
}