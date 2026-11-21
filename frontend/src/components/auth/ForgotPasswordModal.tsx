import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from "../../schema/auth.schema";
import { applyBackendFieldErrors, extractBackendMessage } from "../../utils/apiError";

export interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type ResetStep = "request" | "reset" | "done";

export function ForgotPasswordModal({
  open,
  onClose,
  initialEmail = "",
}: ForgotPasswordModalProps) {
  const { forgotPassword, resetPassword } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [step, setStep] = useState<ResetStep>("request");
  const [targetEmail, setTargetEmail] = useState(initialEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const requestForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
  });

  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const isSubmitting =
    requestForm.formState.isSubmitting || resetForm.formState.isSubmitting;

  useEffect(() => {
    if (open) {
      setStep("request");
      setTargetEmail(initialEmail);
      setShowPassword(false);
      setServerError(null);
      requestForm.reset({ email: initialEmail });
      resetForm.reset({
        email: initialEmail,
        code: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [open, initialEmail, requestForm, resetForm]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isSubmitting, onClose]);

  const handleSendCode = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await forgotPassword({ email: values.email });
      setTargetEmail(values.email);
      resetForm.reset({
        email: values.email,
        code: "",
        newPassword: "",
        confirmPassword: "",
      });
      setStep("reset");
    } catch (err) {
      applyBackendFieldErrors(err, requestForm.setError);
      setServerError(
        extractBackendMessage(
          err,
          "Could not send reset code. Please try again."
        )
      );
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await resetPassword({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
      });
      setStep("done");
    } catch (err) {
      applyBackendFieldErrors(err, resetForm.setError);
      setServerError(
        extractBackendMessage(
          err,
          "Unable to reset password. Check your code and try again."
        )
      );
    }
  };

  const codeField = resetForm.register("code");

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => {
              if (!isSubmitting) onClose();
            }}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, scale: 0.96, y: 10 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900 p-6 shadow-2xl shadow-black/80"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 right-0 h-32 w-48 rounded-full bg-emerald-900/30 blur-2xl"
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    id="forgot-password-title"
                    className="text-lg font-bold tracking-tight text-slate-100"
                  >
                    {step === "request" && "Forgot password"}
                    {step === "reset" && "Reset your password"}
                    {step === "done" && "Password updated"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {step === "request" &&
                      "We'll send a 6-character reset code to your email."}
                    {step === "reset" && `Code sent to ${targetEmail}`}
                    {step === "done" &&
                      "You can now sign in with your new password."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Server / API Error Alert */}
            {serverError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-300"
              >
                {serverError}
              </div>
            )}

            {/* Step 1: Request Reset Code */}
            {step === "request" && (
              <form
                onSubmit={requestForm.handleSubmit(handleSendCode)}
                noValidate
                className="mt-5 space-y-4"
              >
                <div>
                  <label
                    htmlFor="reset-request-email"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="reset-request-email"
                      type="email"
                      autoComplete="email"
                      placeholder="player@example.com"
                      disabled={isSubmitting}
                      {...requestForm.register("email")}
                      className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:opacity-50 ${
                        requestForm.formState.errors.email
                          ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                          : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
                      }`}
                    />
                  </div>
                  {requestForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-rose-400">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{isSubmitting ? "Sending..." : "Send Reset Code"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: 6-Char Code + New Password */}
            {step === "reset" && (
              <form
                onSubmit={resetForm.handleSubmit(handleResetPassword)}
                noValidate
                className="mt-5 space-y-4"
              >
                <div>
                  <label
                    htmlFor="reset-code"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    6-Character Code (A–Z / 0–9)
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    maxLength={6}
                    autoCapitalize="characters"
                    placeholder="A7K9M2"
                    disabled={isSubmitting}
                    {...codeField}
                    onChange={(e) => {
                      const sanitized = e.target.value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .toUpperCase()
                        .slice(0, 6);
                      resetForm.setValue("code", sanitized, {
                        shouldValidate: false,
                        shouldDirty: true,
                      });
                    }}
                    className={`w-full rounded-xl border bg-neutral-950/80 px-3.5 py-2.5 text-center font-mono text-base font-extrabold tracking-[0.28em] text-amber-200 uppercase placeholder:text-neutral-600 placeholder:tracking-normal placeholder:font-sans placeholder:font-normal focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      resetForm.formState.errors.code
                        ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                        : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
                    }`}
                  />
                  {resetForm.formState.errors.code && (
                    <p className="mt-1 text-xs text-rose-400">
                      {resetForm.formState.errors.code.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reset-new-password"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="reset-new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      disabled={isSubmitting}
                      {...resetForm.register("newPassword")}
                      className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:opacity-50 ${
                        resetForm.formState.errors.newPassword
                          ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                          : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="mt-1 text-xs text-rose-400">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="reset-confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      disabled={isSubmitting}
                      {...resetForm.register("confirmPassword")}
                      className={`w-full rounded-xl border bg-neutral-950/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-neutral-600 transition focus:outline-none focus:ring-2 disabled:opacity-50 ${
                        resetForm.formState.errors.confirmPassword
                          ? "border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/35"
                          : "border-neutral-700/80 focus:border-amber-400/70 focus:ring-amber-400/35"
                      }`}
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-400">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setServerError(null);
                      setStep("request");
                    }}
                    disabled={isSubmitting}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3.5 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Change email</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{isSubmitting ? "Resetting..." : "Reset Password"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {step === "done" && (
              <div className="mt-5 space-y-5">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/35 p-3.5 text-xs text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span>
                    Your password has been reset. Use your new password to sign in.
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}