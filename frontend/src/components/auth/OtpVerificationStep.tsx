import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, KeyRound, Loader2, MailCheck, RotateCw } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {verifyOtpSchema, type VerifyOtpFormValues } from "../../schema/auth.schema";
import { applyBackendFieldErrors, extractBackendMessage } from "../../utils/apiError";
import type { AuthResponse } from "../../types/auth";

export interface OtpVerificationStepProps {
  email: string;
  onVerified?: (response: AuthResponse) => void;
  onBack?: () => void;
  resendCooldownSeconds?: number;
  className?: string;
}

const OTP_LENGTH = 6;
const ALPHANUMERIC_CHAR_REGEX = /^[A-Za-z0-9]$/;
const ALPHANUMERIC_STRIP_REGEX = /[^A-Za-z0-9]/g;

export function OtpVerificationStep({
  email,
  onVerified,
  onBack,
  resendCooldownSeconds = 60,
  className = "",
}: OtpVerificationStepProps) {
  const { verifyEmailOtp, resendVerificationOtp } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [chars, setChars] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cooldown]);

  const code = chars.join("");
  const isComplete = code.length === OTP_LENGTH;
  const activeError = errors.code?.message || errors.email?.message || serverError;

  const syncCodeSlots = (nextSlots: string[]) => {
    setChars(nextSlots);
    setValue("code", nextSlots.join(""), { shouldValidate: false });
    if (errors.code) clearErrors("code");
    if (serverError) setServerError(null);
  };

  const focusSlot = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  };

  const onSubmit = async (values: VerifyOtpFormValues) => {
    setServerError(null);

    try {
      const response = await verifyEmailOtp({
        email: values.email,
        code: values.code,
      });
      onVerified?.(response);
    } catch (err) {
      applyBackendFieldErrors(err, setError);
      setServerError(
        extractBackendMessage(
          err,
          "Invalid or expired verification code. Please try again."
        )
      );
    }
  };

  const handleInvalidSubmit = () => {
    const firstEmpty = chars.findIndex((c) => c === "");
    focusSlot(firstEmpty === -1 ? 0 : firstEmpty);
  };

  const handleChange = (index: number, rawValue: string) => {
    const cleaned = rawValue.replace(ALPHANUMERIC_STRIP_REGEX, "").toUpperCase();

    if (cleaned.length > 1) {
      const next = [...chars];
      for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i++) {
        next[index + i] = cleaned[i];
      }
      syncCodeSlots(next);
      const nextEmpty = next.findIndex((c) => c === "");
      focusSlot(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty);
      return;
    }

    const nextChar = cleaned.slice(0, 1);
    const next = [...chars];
    next[index] = nextChar;
    syncCodeSlots(next);

    if (nextChar && index < OTP_LENGTH - 1) {
      focusSlot(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (chars[index]) {
        const next = [...chars];
        next[index] = "";
        syncCodeSlots(next);
      } else if (index > 0) {
        const next = [...chars];
        next[index - 1] = "";
        syncCodeSlots(next);
        focusSlot(index - 1);
      }
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusSlot(index - 1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusSlot(index + 1);
      return;
    }

    if (ALPHANUMERIC_CHAR_REGEX.test(e.key) && chars[index] === e.key.toUpperCase()) {
      e.preventDefault();
      focusSlot(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(ALPHANUMERIC_STRIP_REGEX, "")
      .toUpperCase()
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    syncCodeSlots(next);

    const targetIndex =
      pasted.length >= OTP_LENGTH ? OTP_LENGTH - 1 : pasted.length;
    focusSlot(targetIndex);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || isSubmitting) return;

    setServerError(null);
    clearErrors();
    setIsResending(true);

    try {
      await resendVerificationOtp({ email });
      syncCodeSlots(Array(OTP_LENGTH).fill(""));
      setCooldown(resendCooldownSeconds);
      focusSlot(0);
    } catch (err) {
      setServerError(
        extractBackendMessage(
          err,
          "Could not resend code right now. Please wait a moment and retry."
        )
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-300">
          <MailCheck className="h-3.5 w-3.5 text-amber-400" />
          <span>Email Verification</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          Check your inbox
        </h2>

        <p className="text-sm leading-relaxed text-neutral-400">
          We sent a 6-character code (letters &amp; numbers) to{" "}
          <span className="font-semibold text-amber-200 break-all">{email}</span>.
        </p>
      </div>

      {/* OTP Form */}
      <form
        onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)}
        noValidate
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="otp-slot-0"
            className="mb-2.5 flex items-center justify-between text-xs font-medium text-neutral-300"
          >
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span>6-Character Verification Code</span>
            </span>
            <span className="font-mono text-[11px] text-neutral-500 uppercase">
              A–Z / 0–9
            </span>
          </label>

          {/* 6-Slot Responsive Grid */}
          <div
            className="grid grid-cols-6 gap-2 sm:gap-2.5"
            role="group"
            aria-label="6-character OTP input"
          >
            {chars.map((char, idx) => {
              const filled = Boolean(char);
              return (
                <input
                  key={idx}
                  id={`otp-slot-${idx}`}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={char}
                  disabled={isSubmitting || isResending}
                  aria-label={`Character ${idx + 1} of ${OTP_LENGTH}`}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`h-12 sm:h-14 w-full rounded-xl border text-center font-mono text-lg sm:text-xl font-extrabold uppercase tracking-wider shadow-inner transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    activeError
                      ? "border-rose-500/60 bg-rose-950/20 text-rose-200 focus:border-rose-400 focus:ring-rose-500/40"
                      : filled
                      ? "border-amber-400/60 bg-neutral-800/95 text-amber-200 focus:border-amber-400 focus:ring-amber-400/40"
                      : "border-neutral-700/80 bg-neutral-950/80 text-slate-100 focus:border-amber-400/70 focus:ring-amber-400/40"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Inline Error Alert */}
        {activeError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-3.5 py-2.5 text-xs font-medium text-rose-300"
          >
            {activeError}
          </div>
        )}

        {/* Verify Button */}
        <button
          type="submit"
          disabled={!isComplete || isSubmitting || isResending}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isSubmitting ? "Verifying code..." : "Verify & Enter Table"}</span>
        </button>
      </form>

      {/* Resend & Back Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-800 pt-4 text-xs">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting || isResending}
            className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-neutral-400 transition hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Change email or details</span>
          </button>
        ) : (
          <span className="text-neutral-500">Check spam folder if missing</span>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending || isSubmitting}
          className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-amber-300 transition hover:text-amber-200 disabled:cursor-not-allowed disabled:text-neutral-500"
        >
          <RotateCw
            className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`}
          />
          <span>
            {isResending
              ? "Sending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
          </span>
        </button>
      </div>
    </motion.div>
  );
}