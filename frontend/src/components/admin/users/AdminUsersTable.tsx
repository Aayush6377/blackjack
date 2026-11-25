import { Coins, Eye, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AdminUserSummary } from "../../../types/adminUser";

interface AdminUsersTableProps {
  users: AdminUserSummary[];
  togglingUserId: string | null;
  onToggleEnabled: (user: AdminUserSummary) => void;
  onOpenAddChips: (user: AdminUserSummary) => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitials(name?: string, email?: string): string {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminUsersTable({
  users,
  togglingUserId,
  onToggleEnabled,
  onOpenAddChips,
}: AdminUsersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-400/20 bg-neutral-950/90">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800/90 bg-neutral-900/70 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              <th className="px-5 py-3.5">Player</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Wallet Balance</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-800/75">
            {users.map((user) => {
              const isToggling = togglingUserId === user.id;

              return (
                <tr
                  key={user.id}
                  className="transition hover:bg-neutral-900/60"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.name}
                          className="h-9 w-9 shrink-0 rounded-full border border-neutral-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-300">
                          {getInitials(user.name, user.email)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-slate-100">
                            {user.name || "Unnamed Player"}
                          </span>
                          {user.emailVerified && (
                            <span
                              title="Email verified"
                              className="inline-flex text-emerald-400"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="truncate font-mono text-xs text-neutral-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    {user.enabled ? (
                      <span className="inline-flex rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                        ENABLED
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md border border-rose-500/35 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-300">
                        DISABLED
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-amber-300">
                    {user.walletBalance.toLocaleString("en-IN")} Chips
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-neutral-400">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => onToggleEnabled(user)}
                        className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.enabled
                            ? "border-rose-500/35 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                            : "border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isToggling
                          ? "Saving..."
                          : user.enabled
                          ? "Disable"
                          : "Enable"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenAddChips(user)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        <span>Add Chips</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="View user profile & payment history"
                        aria-label={`View details for ${user.name || user.email}`}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300 transition hover:border-amber-400/55 hover:bg-amber-500/20"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}