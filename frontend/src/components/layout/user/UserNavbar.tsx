import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Coins,
  Layers,
  LifeBuoy,
  LogOut,
  Menu,
  Shield,
  X,
} from "lucide-react";
import { BlackjackLogo } from "../../ui/BlackjackLogo";
import { ChipTokenIcon } from "../../ui/ChipTokenIcon";
import { useAuth } from "../../../hooks/useAuth";

interface NavItem {
  label: string;
  to: string;
  icon: typeof Layers;
}

export interface UserNavbarProps {
  balance?: number;
}

const USER_NAV_ITEMS: NavItem[] = [
  { label: "Rooms", to: "/rooms", icon: Layers },
  { label: "Wallet", to: "/wallet", icon: Coins },
  { label: "Support", to: "/support", icon: LifeBuoy },
];

export function UserNavbar({ balance }: UserNavbarProps) {
  const { user, walletBalance, logout } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [balancePulse, setBalancePulse] = useState<"up" | "down" | null>(null);

  const effectiveBalance = balance ?? walletBalance;
  const prevBalanceRef = useRef<number | null>(
    typeof effectiveBalance === "number" ? effectiveBalance : null
  );

  useEffect(() => {
    const prev = prevBalanceRef.current;
    if (
      typeof effectiveBalance === "number" &&
      typeof prev === "number" &&
      effectiveBalance !== prev
    ) {
      setBalancePulse(effectiveBalance > prev ? "up" : "down");
      const timer = window.setTimeout(() => setBalancePulse(null), 900);
      prevBalanceRef.current = effectiveBalance;
      return () => window.clearTimeout(timer);
    }

    if (typeof effectiveBalance === "number") {
      prevBalanceRef.current = effectiveBalance;
    } else {
      prevBalanceRef.current = null;
    }
  }, [effectiveBalance]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Player";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const pulseClass =
    balancePulse === "up"
      ? "border-emerald-400/60 bg-emerald-950/70 text-emerald-200 ring-2 ring-emerald-400/30"
      : balancePulse === "down"
        ? "border-rose-400/50 bg-rose-950/50 text-rose-200 ring-2 ring-rose-400/25"
        : "border-amber-400/30 bg-gradient-to-b from-amber-500/15 to-neutral-900 text-amber-200 hover:border-amber-400/55 hover:from-amber-500/20";

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-neutral-950/90 backdrop-blur-md">
      {/* Subtle Champagne Gold top highlight */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      />

      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Primary Nav */}
        <div className="flex items-center gap-7 lg:gap-9">
          <BlackjackLogo size="md" onClick={() => navigate("/")} />

          <nav
            aria-label="Primary player navigation"
            className="hidden md:flex items-center gap-1.5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-1"
          >
            {USER_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "text-amber-300"
                      : "text-neutral-400 hover:text-slate-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId={prefersReducedMotion ? undefined : "user-nav-pill"}
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-xl border border-amber-400/35 bg-emerald-950/80 shadow-sm shadow-black/40"
                      />
                    )}
                    <Icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Chip Balance + Admin Pill + Player Profile + Logout */}
        <div className="hidden md:flex items-center gap-3">
          {typeof effectiveBalance === "number" && (
            <motion.button
              type="button"
              onClick={() => navigate("/wallet")}
              title="View chip wallet"
              animate={
                !prefersReducedMotion && balancePulse
                  ? { scale: [1, 1.05, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.28 }}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-inner transition ${pulseClass}`}
            >
              <ChipTokenIcon className="h-4 w-4 shrink-0 text-amber-400" />
              <span className="font-mono text-sm font-bold tabular-nums tracking-tight">
                {effectiveBalance.toLocaleString("en-IN")}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-amber-300/75">
                {effectiveBalance === 1 ? "Chip" : "Chips"}
              </span>
            </motion.button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-xs transition hover:border-neutral-700 hover:bg-neutral-900"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="h-7 w-7 rounded-full border border-amber-400/45 object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/45 bg-emerald-950 font-bold text-amber-300">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="text-left leading-tight">
              <div className="max-w-[130px] truncate font-semibold text-slate-200">
                {displayName}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/90">
                Active Seat
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2 text-xs font-semibold text-neutral-300 transition hover:border-rose-500/40 hover:bg-rose-950/35 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-neutral-300 transition hover:border-amber-500/35 hover:text-amber-300 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="border-t border-neutral-800/90 bg-neutral-950/98 px-4 py-4 md:hidden space-y-3.5"
          >
            {typeof effectiveBalance === "number" && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/wallet");
                }}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-amber-400/25 bg-neutral-900/90 px-3.5 py-2.5"
              >
                <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400">
                  <ChipTokenIcon className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Available Chips</span>
                </span>
                <span className="font-mono text-sm font-bold tabular-nums text-amber-200">
                  {effectiveBalance.toLocaleString("en-IN")}
                </span>
              </button>
            )}

            <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
              {USER_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "border border-amber-400/35 bg-emerald-950/75 text-amber-300"
                        : "text-neutral-300 hover:bg-neutral-900 hover:text-amber-200"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/admin");
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-left text-sm font-semibold text-amber-300"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Console</span>
                </button>
              )}
            </nav>

            <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
              <span className="truncate text-xs text-neutral-400">
                Signed in as{" "}
                <strong className="text-slate-200">{displayName}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-950/55 disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}