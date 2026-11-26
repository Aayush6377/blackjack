import { useState } from "react";
import { Loader2, ShieldCheck, User } from "lucide-react";
import type { LoginFormValues } from "../../schema/auth.schema";

export type DemoAccountRole = "user" | "admin";

export interface DemoLoginButtonsProps {
  onDemoLogin: (credentials: LoginFormValues, role: DemoAccountRole) => Promise<void>;
  disabled?: boolean;
}

const DEMO_USER_EMAIL = import.meta.env.VITE_DEMO_USER_EMAIL?.trim() ?? "";
const DEMO_ADMIN_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL?.trim() ?? "";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? "";

export function DemoLoginButtons({
  onDemoLogin,
  disabled = false,
}: DemoLoginButtonsProps) {
  const [loadingRole, setLoadingRole] = useState<DemoAccountRole | null>(null);

  const hasUserDemo = Boolean(DEMO_USER_EMAIL && DEMO_PASSWORD);
  const hasAdminDemo = Boolean(DEMO_ADMIN_EMAIL && DEMO_PASSWORD);

  if (!hasUserDemo && !hasAdminDemo) {
    return null;
  }

  const isBusy = disabled || loadingRole !== null;

  const handleQuickLogin = async (role: DemoAccountRole) => {
    const email = role === "admin" ? DEMO_ADMIN_EMAIL : DEMO_USER_EMAIL;
    if (!email || !DEMO_PASSWORD || isBusy) return;

    setLoadingRole(role);
    try {
      await onDemoLogin({ email, password: DEMO_PASSWORD }, role);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-neutral-950/70 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
          Instant Portfolio Preview
        </span>
        <span className="text-[11px] text-neutral-500">One-click sign in</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {hasUserDemo && (
          <button
            type="button"
            onClick={() => void handleQuickLogin("user")}
            disabled={isBusy}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-700/80 bg-neutral-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:bg-neutral-800 hover:text-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingRole === "user" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <User className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>{loadingRole === "user" ? "Signing in..." : "Demo User"}</span>
          </button>
        )}

        {hasAdminDemo && (
          <button
            type="button"
            onClick={() => void handleQuickLogin("admin")}
            disabled={isBusy}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:border-amber-400/60 hover:bg-amber-500/20 hover:text-amber-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingRole === "admin" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
            )}
            <span>{loadingRole === "admin" ? "Signing in..." : "Demo Admin"}</span>
          </button>
        )}
      </div>
    </div>
  );
}