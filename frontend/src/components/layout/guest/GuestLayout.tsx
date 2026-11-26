import { Outlet } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { UserNavbar } from "../user/UserNavbar";
import { GuestNavbar } from "./GuestNavbar";
import { AppFooter } from "../../ui/AppFooter";

export function GuestLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-slate-100">
      {isAuthenticated ? <UserNavbar /> : <GuestNavbar />}

      <main className="relative flex-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-950/25 to-transparent"
        />
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}