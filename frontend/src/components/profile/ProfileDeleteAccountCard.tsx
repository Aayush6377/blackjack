import { useState } from "react";
import { AlertTriangle, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSendAccountDeleteOtp } from "../../hooks/useProfile";

interface ProfileDeleteAccountCardProps {
  email: string;
  isDeleting: boolean;
  onRequestDeleteConfirm: (code: string) => void;
}

export function ProfileDeleteAccountCard({
  email,
  isDeleting,
  onRequestDeleteConfirm,
}: ProfileDeleteAccountCardProps) {
  const sendDeleteOtpMutation = useSendAccountDeleteOtp();

  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSendDeleteOtp = async () => {
    setError(null);
    try {
      const res = await sendDeleteOtpMutation.mutateAsync();
      setOtpSent(true);
      toast.success(res.message || `Deletion code sent to ${email}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send deletion OTP.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = code.trim().toUpperCase();
    if (normalized.length !== 6) {
      setError("Enter the 6-character deletion OTP sent to your email.");
      return;
    }

    onRequestDeleteConfirm(normalized);
  };

  const isBusy = sendDeleteOtpMutation.isPending || isDeleting;

  return (
    <section className="rounded-2xl border border-rose-500/35 bg-neutral-900/80 p-5 shadow-lg shadow-black/30 sm:p-6">
      <div className="flex flex-col justify-between gap-3 border-b border-neutral-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Danger Zone</span>
          </div>
          <h2 className="mt-1 text-lg font-bold text-slate-100">
            Delete Account
          </h2>
          <p className="text-xs text-neutral-400">
            Permanently removes your wallet, chips, gameplay history, and
            sessions in the background.{" "}
            <strong className="text-rose-300">
              No tokens or chips will be issued or restored once deleted.
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleSendDeleteOtp()}
          disabled={isBusy}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendDeleteOtpMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>{otpSent ? "Resend Deletion OTP" : "Send Deletion OTP"}</span>
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

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="delete-account-otp"
            className="mb-1.5 block text-xs font-medium text-neutral-300"
          >
            6-Char Deletion OTP Code *
          </label>
          <input
            id="delete-account-otp"
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            disabled={isBusy}
            placeholder="Enter code from email"
            className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm uppercase tracking-widest text-slate-100 placeholder:text-neutral-500 placeholder:tracking-normal focus:border-rose-400/70 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950/40 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span>Delete Account</span>
        </button>
      </form>
    </section>
  );
}