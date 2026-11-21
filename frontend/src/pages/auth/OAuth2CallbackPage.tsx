import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { BlackjackLoader } from "../../components/ui/BlackjackLoader";
import { BlackjackErrorState } from "../../components/ui/BlackjackErrorState";

export function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { applyAuthResponse } = useAuth();

  const processedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const oauthError = searchParams.get("error");
    const accessToken = searchParams.get("token");

    if (oauthError) {
      const decodedError = decodeURIComponent(oauthError);
      setErrorMessage(
        decodedError || "OAuth sign-in was cancelled or failed."
      );
      return;
    }

    if (!accessToken) {
      setErrorMessage(
        "No authentication token was returned from the login provider."
      );
      return;
    }

    applyAuthResponse({
      accessToken,
    } as Parameters<typeof applyAuthResponse>[0]);

    toast.success("Signed in successfully!");
    navigate("/rooms", { replace: true });
  }, [searchParams, applyAuthResponse, navigate]);

  if (errorMessage) {
    return (
      <BlackjackErrorState
        variant="unauthorized"
        code="OAUTH"
        title="Social sign-in failed"
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
      label="Completing sign-in"
      sublabel="Syncing your table credentials..."
    />
  );
}