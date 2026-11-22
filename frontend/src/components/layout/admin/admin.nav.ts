import { Coins, FileSearch, Gift, Layers, LayoutDashboard, Users } from "lucide-react";
import type { AdminNavItem } from "./AdminSidebar";

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Overview",
    to: "/admin/overview",
    icon: LayoutDashboard,
    description: "Platform metrics",
  },
  {
    label: "Plans Management",
    to: "/admin/plans",
    icon: Coins,
    description: "Chip packs & sales",
  },
  {
    label: "User Management",
    to: "/admin/users",
    icon: Users,
    description: "Accounts & balances",
  },
  {
    label: "Daily Reward Management",
    to: "/admin/rewards",
    icon: Gift,
    description: "Streak & day configs",
  },
  {
    label: "Rooms Management",
    to: "/admin/rooms",
    icon: Layers,
    description: "Tables & rules",
  },
  {
    label: "Admin Audit",
    to: "/admin/audit-logs",
    icon: FileSearch,
    description: "Change history",
  },
];