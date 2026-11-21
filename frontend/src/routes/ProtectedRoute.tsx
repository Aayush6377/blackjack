import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { BlackjackLoader } from "../components/ui/BlackjackLoader";

export interface ProtectedRouteProps {
  redirectTo?: string;
}

export function ProtectedRoute({ redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <BlackjackLoader
        fullScreen
        label="Verifying table access"
        sublabel="Checking your active session..."
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

  return <Outlet />;
}