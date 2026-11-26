import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AuthBlackjackShowcase } from "../../components/auth/AuthBlackjackShowcase";
import { OtpVerificationStep } from "../../components/auth/OtpVerificationStep";
import { RegisterForm } from "../../components/auth/RegisterForm";
import { BlackjackLogo } from "../../components/ui/BlackjackLogo";

interface LocationState {
  from?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const [step, setStep] = useState<"register" | "otp">("register");
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const resolveDestination = (): string => {
    const state = location.state as LocationState | null;
    if (state?.from) {
      return `${state.from.pathname}${state.from.search ?? ""}${state.from.hash ?? ""}`;
    }
    return "/rooms";
  };

  const handleRegistered = (email: string) => {
    setRegisteredEmail(email);
    setStep("otp");
  };

  const handleVerified = () => {
    navigate(resolveDestination(), { replace: true });
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-slate-100 grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-6 xl:col-span-7 flex">
        <AuthBlackjackShowcase
          headline="Deal yourself into live 21."
          subcopy="Create your player profile, verify via 6-character code, and jump straight into multiplayer tables."
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
            <BlackjackLogo
              size="sm"
              onClick={() => navigate("/")}
            />

            {/* Step Indicator */}
            <div
              aria-label="Signup progress"
              className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400"
            >
              <span
                className={`rounded-full px-2.5 py-0.5 font-semibold ${
                  step === "register"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/35"
                    : "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                1. Details
              </span>
              <span className="text-neutral-600">→</span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-semibold ${
                  step === "otp"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/35"
                    : "bg-neutral-900 text-neutral-500 border border-neutral-800"
                }`}
              >
                2. OTP
              </span>
            </div>
          </div>

          {/* Auth Card Container */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl shadow-black/75">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 right-0 h-40 w-56 rounded-full bg-emerald-900/25 blur-3xl"
            />

            <AnimatePresence mode="wait">
              {step === "register" ? (
                <motion.div
                  key="register-step"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm onRegistered={handleRegistered} loginPath="/login" />
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 12 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <OtpVerificationStep
                    email={registeredEmail}
                    onVerified={handleVerified}
                    onBack={() => setStep("register")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}