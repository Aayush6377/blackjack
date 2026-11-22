import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AppFooter } from "../../ui/AppFooter";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <AdminSidebar />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <main className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col lg:min-h-screen">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-950/25 to-transparent"
          />
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-6 pb-28 sm:px-6 sm:pb-32 lg:px-8 lg:pt-8 lg:pb-36">
            <Outlet />
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}