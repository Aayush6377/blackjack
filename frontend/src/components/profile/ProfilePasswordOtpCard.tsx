import { useState } from "react";
import { KeyRound, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  useSendPasswordChangeOtp,
  useUpdatePasswordWithOtp,
} from "../../hooks/useProfile";

interface ProfilePasswordOtpCardProps {
  email: string;
}

export function ProfilePasswordOtpCard({ email }: ProfilePasswordOtpCardProps) {
  const sendOtpMutation = useSendPasswordChangeOtp();
  const updatePasswordMutation = useUpdatePasswordWithOtp();

  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async () => {
    setError(null);
    try {
      const res = await sendOtpMutation.mutateAsync();
      setOtpSent(true);
      toast.success(res.message || `Verification code sent to ${email}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send verification OTP.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 6) {
      setError("Enter the 6-character verification code sent to your email.");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("New password must be between 8 and 72 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await updatePasswordMutation.mutateAsync({
        code: normalizedCode,
        newPassword,
      });
      toast.success(res.message || "Password updated successfully.");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update password.";
      setError(msg);
      toast.error(msg);
    }
  };

  const isBusy =
    sendOtpMutation.isPending || updatePasswordMutation.isPending;

  return (
    <section className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
      <div className="flex flex-col justify-between gap-3 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
            <KeyRound className="h-3.5 w-3.5" />
            <span>Password &amp; Security</span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-slate-100">
            Change or Set Password via OTP
          </h2>
          <p className="text-xs text-neutral-400">
            Request a 6-character code to <span className="font-mono">{email}</span>{" "}
            — works even if you signed in via OAuth or forgot your current password.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleSendOtp()}
          disabled={isBusy}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendOtpMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>{otpSent ? "Resend OTP" : "Send OTP"}</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/35 px-3.5 py-2.5 text-xs font-medium text-rose-200"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="otp-code-input"
              className="mb-1.5 block text-xs font-medium text-neutral-300"
            >
              6-Char OTP Code *
            </label>
            <input
              id="otp-code-input"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              disabled={isBusy}
              placeholder="e.g. 8K4P9X"
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm uppercase tracking-widest text-slate-100 placeholder:text-neutral-500 placeholder:tracking-normal focus:border-amber-400/70 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="new-password-input"
              className="mb-1.5 block text-xs font-medium text-neutral-300"
            >
              New Password *
            </label>
            <input
              id="new-password-input"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={isBusy}
              placeholder="Min 8 characters"
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-500 focus:border-amber-400/70 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password-input"
              className="mb-1.5 block text-xs font-medium text-neutral-300"
            >
              Confirm Password *
            </label>
            <input
              id="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={isBusy}
              placeholder="Repeat new password"
              className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-500 focus:border-amber-400/70 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatePasswordMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </section>
  );
}