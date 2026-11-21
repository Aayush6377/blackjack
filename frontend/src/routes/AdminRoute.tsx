import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { BlackjackLoader } from "../components/ui/BlackjackLoader";

export interface AdminRouteProps {
  redirectTo?: string;
  unauthorizedTo?: string;
  allowedRoles?: string[];
}

export function AdminRoute({ redirectTo = "/login", unauthorizedTo = "/rooms", allowedRoles = ["ADMIN"] }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <BlackjackLoader
        fullScreen
        label="Verifying admin access"
        sublabel="Checking your session and role permissions..."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  const normalizedRole = user?.role?.trim().toUpperCase();
  const hasRequiredRole =
    Boolean(normalizedRole) &&
    allowedRoles.some((role) => role.trim().toUpperCase() === normalizedRole);

  if (!hasRequiredRole) {
    return (
      <Navigate
        to={unauthorizedTo}
        replace
        state={{ from: location, reason: "admin_required" }}
      />
    );
  }

  return <Outlet />;
}