import { RotateCcw } from "lucide-react";
import { AdminPageHeader } from "../../components/layout/admin/AdminPageHeader";
import { ProfileContent } from "../../components/profile/ProfileContent";
import { useCurrentProfile } from "../../hooks/useProfile";

export default function AdminProfilePage() {
  const { refetch, isFetching } = useCurrentProfile();

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <AdminPageHeader
        title="Admin Profile"
        subtitle="Manage your administrator profile, OTP password updates, session logout, and account deletion."
        action={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/35 bg-neutral-900 px-3.5 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        }
      />

      <ProfileContent />
    </div>
  );
}