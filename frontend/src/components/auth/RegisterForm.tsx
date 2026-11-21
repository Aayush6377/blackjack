import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  registerSchema,
  type RegisterFormValues,
} from "../../schema/auth.schema";
import {
  applyBackendFieldErrors,
  extractBackendMessage,
} from "../../utils/apiError";
import { OAuthButtons } from "./OAuthButtons";
import type { OtpResponse, RegisterRequest } from "../../types/auth";

export interface RegisterFormProps {
  onRegistered?: (email: string, response: OtpResponse) => void;
  loginPath?: string;
  className?: string;
}

export function RegisterForm({
  onRegistered,
  loginPath = "/login",
  className = "",
}: RegisterFormProps) {
  const { register: registerUser } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    const payload: RegisterRequest = {
      name: values.username,
      email: values.email,
      password: values.password,
    };

    try {
      const res = await registerUser(payload);
      onRegistered?.(values.email, res);
    } catch (err) {
      const applied = applyBackendFieldErrors(err, setError);

      // Map backend "name" field errors onto the form's "username" input
      const backendFieldErrors = (
        err as { response?: { data?: { fieldErrors?: Record<string, string> } } }
      )?.response?.data?.fieldErrors;
      if (backendFieldErrors?.name) {
        setError("username", {
          type: "server",
          message: backendFieldErrors.name,
        });
      }

      if (!applied && !backendFieldErrors?.name) {
        setServerError(
          extractBackendMessage(
            err,
            "Could not create your account. Please check your details and try again."
          )
        );
      } else {
        setServerError(
          extractBackendMessage(
            err,
            "Could not create your account. Please check your details and try again."
          )
        );
      }
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`space-y-6 ${className}`}
    >
      {/* Form Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          Create your account
        </h2>
        <p className="text-sm text-neutral-400">
          Sign up and verify your email with a 6-character code to take your seat.
        </p>
      </div>

      {/* Server / API Error Banner */}
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-300"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Username */}
        <div>
          <label
            htmlFor="register-username"
            className="mb-1.5 block text-xs font-medium text-neutral-300"
          >
            Username
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              placeholder="ace_spades"
              disabled={isSubmitting}
              {...register("username")}
              className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.username
                  ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                  : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
              }`}
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-xs text-rose-400">{errors.username.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-xs font-medium text-neutral-300"
          >
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              id="register-email"
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
            <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-xs font-medium text-neutral-300"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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
              aria-label={showPassword ? "Hide password" : "Show password"}
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
            <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-1.5 block text-xs font-medium text-neutral-300"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              disabled={isSubmitting}
              {...register("confirmPassword")}
              className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.confirmPassword
                  ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                  : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword ? "Hide confirm password" : "Show confirm password"
              }
              disabled={isSubmitting}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:opacity-40"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">
              {errors.confirmPassword.message}
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
            <UserPlus className="h-4 w-4" />
          )}
          <span>{isSubmitting ? "Creating account..." : "Create Account & Send OTP"}</span>
        </button>
      </form>

      {/* Google & GitHub OAuth */}
      <OAuthButtons mode="signup" disabled={isSubmitting} />

      {/* Switch to Login */}
      <p className="text-center text-xs text-neutral-400">
        Already have a seat?{" "}
        <Link
          to={loginPath}
          className="font-semibold text-amber-300 transition hover:text-amber-200 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}