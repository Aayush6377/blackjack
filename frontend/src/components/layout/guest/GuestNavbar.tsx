import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, Code2, LogIn, Menu, UserCheck, X } from "lucide-react";
import { BlackjackLogo } from "../../ui/BlackjackLogo";

interface GuestNavItem {
  label: string;
  to: string;
  icon: typeof BookOpen;
}

const GUEST_NAV_ITEMS: GuestNavItem[] = [
  { label: "Game Rules", to: "/rules", icon: BookOpen },
  { label: "Architecture", to: "/architecture", icon: Code2 },
  { label: "About", to: "/about", icon: UserCheck },
];

export function GuestNavbar() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-neutral-950/90 backdrop-blur-md">
      {/* Subtle Champagne Gold top highlight */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      />

      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Static Page Nav */}
        <div className="flex items-center gap-7 lg:gap-9">
          <BlackjackLogo size="md" onClick={() => navigate("/")} />

          <nav
            aria-label="Guest navigation"
            className="hidden md:flex items-center gap-1.5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-1"
          >
            {GUEST_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
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
                        layoutId={
                          prefersReducedMotion ? undefined : "guest-nav-pill"
                        }
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 32,
                        }}
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

        {/* Right: Login Button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 sm:text-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </button>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle guest navigation menu"
          aria-expanded={mobileOpen}
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-neutral-300 transition hover:border-amber-500/35 hover:text-amber-300 md:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }
            }
            animate={
              prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
            }
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="space-y-3 border-t border-neutral-800/90 bg-neutral-950/98 px-4 py-4 md:hidden"
          >
            <nav
              aria-label="Mobile guest navigation"
              className="flex flex-col gap-1.5"
            >
              {GUEST_NAV_ITEMS.map(({ label, to, icon: Icon }) => (
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
            </nav>

            <div className="border-t border-neutral-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 transition hover:bg-amber-400"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}