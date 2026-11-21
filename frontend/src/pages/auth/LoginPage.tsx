import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { AuthBlackjackShowcase } from "../../components/auth/AuthBlackjackShowcase";
import { ForgotPasswordModal } from "../../components/auth/ForgotPasswordModal";
import { OAuthButtons } from "../../components/auth/OAuthButtons";
import { BlackjackLogo } from "../../components/ui/BlackjackLogo";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema, type LoginFormValues } from "../../schema/auth.schema";
import { applyBackendFieldErrors, extractBackendMessage } from "../../utils/apiError";

interface LocationState {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const currentEmail = watch("email");

  const resolveDestination = (): string => {
    const state = location.state as LocationState | null;
    if (state?.from) {
      return `${state.from.pathname}${state.from.search ?? ""}${state.from.hash ?? ""}`;
    }
    return "/rooms";
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      navigate(resolveDestination(), { replace: true });
    } catch (err) {
      applyBackendFieldErrors(err, setError);
      setServerError(
        extractBackendMessage(
          err,
          "Invalid credentials. Please check your email and password."
        )
      );
    }
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-slate-100 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-6 xl:col-span-7 flex">
        <AuthBlackjackShowcase
          headline="Step back up to the felt."
          subcopy="Sign in to access your chip balance, join live multiplayer tables, and chase natural 21."
          className="w-full"
        />
      </div>

      <section className="lg:col-span-6 xl:col-span-5 relative flex flex-col justify-center px-4 py-8 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 h-56 w-80 -translate-x-1/2 rounded-full bg-emerald-900/25 blur-3xl lg:hidden"
        />

        <div className="relative z-10 mx-auto w-full max-w-md">
          {/* Brand Header */}
          <div className="mb-6 flex items-center justify-between">
            <BlackjackLogo size="sm" onClick={() => navigate("/rooms")} />
          </div>

          {/* Auth Card */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl shadow-black/75"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 right-0 h-40 w-56 rounded-full bg-emerald-900/25 blur-3xl"
            />

            <div className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                  Welcome back
                </h1>
                <p className="text-sm text-neutral-400">
                  Sign in with your account or OAuth provider to play.
                </p>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-300"
                >
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="player@example.com"
                      disabled={isSubmitting}
                      {...register("email")}
                      className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.email
                          ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                          : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password + Forgot Password Trigger */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-medium text-neutral-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      disabled={isSubmitting}
                      className="cursor-pointer text-xs font-semibold text-amber-300 transition hover:text-amber-200 hover:underline disabled:opacity-40"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                      {...register("password")}
                      className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        errors.password
                          ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                          : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={isSubmitting}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:opacity-40"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
                </button>
              </form>

              {/* Google & GitHub OAuth */}
              <OAuthButtons mode="login" disabled={isSubmitting} />

              {/* Switch to Signup */}
              <p className="text-center text-xs text-neutral-400">
                New to the table?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-amber-300 transition hover:text-amber-200 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={currentEmail}
      />
    </main>
  );
}