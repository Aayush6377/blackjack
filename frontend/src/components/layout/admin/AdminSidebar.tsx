import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LogOut, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BlackjackLogo } from "../../ui/BlackjackLogo";
import { useAuth } from "../../../hooks/useAuth";
import { ADMIN_NAV_ITEMS } from "./admin.nav";

export interface AdminNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  description?: string;
}

interface SidebarPanelProps {
  onNavigate?: () => void;
}

function SidebarPanel({ onNavigate }: SidebarPanelProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName =
    user?.name?.trim() || user?.email?.split("@")[0] || "Admin";

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate?.();
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleOpenProfile = () => {
    onNavigate?.();
    navigate("/admin/profile");
  };

  return (
    <div className="flex h-full flex-col justify-between bg-neutral-950 text-slate-100">
      {/* Top: Logo + Admin Console + Tabs */}
      <div>
        <div
          aria-hidden="true"
          className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
        />

        {/* Brand Header (Logo Only) */}
        <div className="flex items-center border-b border-neutral-800/80 px-5 py-4">
          <BlackjackLogo
            size="sm"
            onClick={() => {
              onNavigate?.();
              navigate("/admin");
            }}
          />
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Admin sidebar navigation"
          className="flex flex-col gap-1 px-3 py-4"
        >
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Admin Console
          </div>

          {ADMIN_NAV_ITEMS.map(({ label, to, icon: Icon, description }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "text-amber-300"
                    : "text-neutral-400 hover:bg-neutral-900/75 hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId={
                        prefersReducedMotion ? undefined : "admin-sidebar-pill"
                      }
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-xl border border-amber-400/35 bg-neutral-900 shadow-sm shadow-black/50"
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-4 w-4 shrink-0 transition ${
                      isActive
                        ? "text-amber-300"
                        : "text-neutral-400 group-hover:text-amber-200"
                    }`}
                  />
                  <div className="relative z-10 min-w-0 flex-1">
                    <div className="truncate leading-snug">{label}</div>
                    {description && (
                      <div
                        className={`truncate text-[11px] ${
                          isActive
                            ? "text-amber-200/70"
                            : "text-neutral-500 group-hover:text-neutral-400"
                        }`}
                      >
                        {description}
                      </div>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: Clickable Profile -> /profile + Logout */}
      <div className="border-t border-neutral-800/80 bg-neutral-950 p-3.5 space-y-2.5">
        <button
          type="button"
          onClick={handleOpenProfile}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-800/90 bg-neutral-900/75 px-3 py-2.5 text-left transition hover:border-amber-400/35 hover:bg-neutral-900"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-9 w-9 shrink-0 rounded-full border border-amber-400/40 object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-neutral-800 text-sm font-bold text-amber-300">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-slate-100">
              {displayName}
            </div>
            <div className="truncate text-[11px] font-medium text-neutral-400">
              {user?.email || "Profile settings"}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/80 px-3.5 py-2 text-xs font-semibold text-neutral-300 transition hover:border-rose-500/40 hover:bg-rose-950/35 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? "Signing out..." : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* Mobile Top Bar with Drawer Toggle */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-amber-500/20 bg-neutral-950/95 px-4 backdrop-blur-md lg:hidden">
        <BlackjackLogo size="sm" onClick={() => setMobileOpen(false)} />

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin sidebar"
          aria-expanded={mobileOpen}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-neutral-300 transition hover:border-amber-500/35 hover:text-amber-300"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside
        aria-label="Admin sidebar"
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-amber-500/20"
      >
        <SidebarPanel />
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.aside
              aria-label="Mobile admin sidebar"
              initial={
                prefersReducedMotion ? { opacity: 1 } : { x: "-100%" }
              }
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed inset-y-0 left-0 z-10 w-72 max-w-[85vw] border-r border-amber-500/20 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close admin sidebar"
                className="absolute right-3 top-3.5 z-20 inline-flex cursor-pointer items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/90 p-1.5 text-neutral-400 transition hover:border-amber-400/40 hover:text-amber-200"
              >
                <X className="h-4 w-4" />
              </button>

              <SidebarPanel onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}