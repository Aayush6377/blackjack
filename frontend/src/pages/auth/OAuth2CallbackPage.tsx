import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { BlackjackLoader } from "../../components/ui/BlackjackLoader";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";

function resolveTargetRoute(role?: string | null): string {
  return role?.trim().toUpperCase() === "ADMIN" ? "/admin" : "/rooms";
}

export function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, applyAuthResponse } = useAuth();

  const processedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authApplied, setAuthApplied] = useState(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const authError = searchParams.get("error");
    const accessToken = searchParams.get("token");

    if (authError) {
      const decodedError = decodeURIComponent(authError);
      setErrorMessage(
        decodedError || "Authentication could not be completed."
      );
      return;
    }

    if (!accessToken) {
      setErrorMessage(
        "No session token was returned from the authentication flow."
      );
      return;
    }

    Promise.resolve(
      applyAuthResponse({
        accessToken,
      } as Parameters<typeof applyAuthResponse>[0])
    )
      .then(() => {
        setAuthApplied(true);
      })
      .catch(() => {
        setErrorMessage("Unable to initialize your session. Please try again.");
      });
  }, [searchParams, applyAuthResponse]);

  useEffect(() => {
    if (!authApplied) return;

    const targetPath = resolveTargetRoute(user?.role);
    toast.success("Authentication successful!");
    navigate(targetPath, { replace: true });
  }, [authApplied, user?.role, navigate]);

  if (errorMessage) {
    return (
      <BlackjackErrorState
        variant="unauthorized"
        code="AUTH"
        title="Authentication failed"
        message={errorMessage}
        fullScreen
        retryLabel="Back to login"
        onRetry={() => navigate("/login", { replace: true })}
        showHome={false}
      />
    );
  }

  return (
    <BlackjackLoader
      fullScreen
      label="Completing authentication"
      sublabel="Syncing your account session..."
    />
  );
}