import { Outlet, useMatch } from "react-router-dom";
import { UserNavbar } from "./UserNavbar";
import { AppFooter } from "../../ui/AppFooter";
import { DailyRewardReminderModal } from "../../rewards/DailyRewardReminderModal";

export function UserLayout() {
  const isTableRoute = Boolean(useMatch("/rooms/:roomId"));

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-slate-100">
      <UserNavbar />

      <main className="relative flex-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-950/25 to-transparent"
        />
        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>

      {!isTableRoute && <AppFooter />}

      <DailyRewardReminderModal />
    </div>
  );
}