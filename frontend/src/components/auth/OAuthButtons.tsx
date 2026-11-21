import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";

export type OAuthProvider = "google" | "github";

export interface OAuthButtonsProps {
  mode?: "login" | "signup";
  disabled?: boolean;
  dividerText?: string;
  className?: string;
}

function getOAuthAuthorizationUrl(provider: OAuthProvider): string {
  const rawBase = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "";
  const backendOrigin = rawBase.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  return `${backendOrigin}/oauth2/authorization/${provider}`;
}

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#EA4335"
        d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.91 6.16-4.91Z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
    </svg>
  );
}

function GitHubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.64 3.01 8.57 7.18 9.96.53.1.72-.23.72-.51 0-.25-.01-.92-.01-1.8-2.92.63-3.54-1.41-3.54-1.41-.48-1.21-1.17-1.53-1.17-1.53-.95-.65.07-.64.07-.64 1.05.07 1.61 1.08 1.61 1.08.94 1.61 2.46 1.14 3.06.87.09-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.19 0-1.15.41-2.08 1.08-2.82-.11-.27-.47-1.33.1-2.78 0 0 .88-.28 2.89 1.08a10.04 10.04 0 0 1 5.26 0c2.01-1.36 2.89-1.08 2.89-1.08.57 1.45.21 2.51.1 2.78.67.74 1.08 1.67 1.08 2.82 0 4.03-2.45 4.92-4.79 5.18.38.33.71.97.71 1.95 0 1.41-.01 2.55-.01 2.89 0 .28.19.61.73.51A10.51 10.51 0 0 0 22.5 12c0-5.8-4.7-10.5-10.5-10.5Z"
      />
    </svg>
  );
}

export function OAuthButtons({
  mode = "login",
  disabled = false,
  dividerText = "Or continue with",
  className = "",
}: OAuthButtonsProps) {
  const [redirectingProvider, setRedirectingProvider] =
    useState<OAuthProvider | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const isBusy = disabled || redirectingProvider !== null;
  const actionPrefix = mode === "signup" ? "Sign up with" : "Continue with";

  const handleOAuthLogin = (provider: OAuthProvider) => {
    if (isBusy) return;
    setRedirectingProvider(provider);
    window.location.assign(getOAuthAuthorizationUrl(provider));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="h-px w-full bg-neutral-800" />
        <span className="shrink-0 bg-neutral-900 px-3 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
          {dividerText}
        </span>
        <div className="h-px w-full bg-neutral-800" />
      </div>

      {/* Provider Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.button
          type="button"
          whileTap={prefersReducedMotion || isBusy ? undefined : { scale: 0.985 }}
          onClick={() => handleOAuthLogin("google")}
          disabled={isBusy}
          aria-label={`${actionPrefix} Google`}
          className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-neutral-700/80 bg-neutral-800/75 px-4 py-2.5 text-sm font-medium text-slate-100 shadow-sm transition hover:border-amber-500/40 hover:bg-neutral-800 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          {redirectingProvider === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          ) : (
            <GoogleIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          )}
          <span>Google</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={prefersReducedMotion || isBusy ? undefined : { scale: 0.985 }}
          onClick={() => handleOAuthLogin("github")}
          disabled={isBusy}
          aria-label={`${actionPrefix} GitHub`}
          className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-neutral-700/80 bg-neutral-800/75 px-4 py-2.5 text-sm font-medium text-slate-100 shadow-sm transition hover:border-amber-500/40 hover:bg-neutral-800 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        >
          {redirectingProvider === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          ) : (
            <GitHubIcon className="h-4 w-4 shrink-0 text-slate-200 transition-transform duration-200 group-hover:scale-105" />
          )}
          <span>GitHub</span>
        </motion.button>
      </div>
    </div>
  );
}