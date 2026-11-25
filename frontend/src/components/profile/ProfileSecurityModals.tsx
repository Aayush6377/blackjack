import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { KeyRound, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteAccountWithOtp,
  useSendAccountDeleteOtp,
  useSendPasswordChangeOtp,
  useUpdatePasswordWithOtp,
} from "../../hooks/useProfile";
import { ConfirmModal } from "../ui/ConfirmModal";

interface ProfileSecurityModalsProps {
  email: string;
  passwordWarningOpen: boolean;
  onClosePasswordWarning: () => void;
  deleteWarningOpen: boolean;
  onCloseDeleteWarning: () => void;
  onAccountDeleted: (message?: string) => Promise<void>;
}

export function ProfileSecurityModals({
  email,
  passwordWarningOpen,
  onClosePasswordWarning,
  deleteWarningOpen,
  onCloseDeleteWarning,
  onAccountDeleted,
}: ProfileSecurityModalsProps) {
  const prefersReducedMotion = useReducedMotion();

  const sendPasswordOtpMutation = useSendPasswordChangeOtp();
  const updatePasswordMutation = useUpdatePasswordWithOtp();
  const sendDeleteOtpMutation = useSendAccountDeleteOtp();
  const deleteAccountMutation = useDeleteAccountWithOtp();

  const [passwordOtpModalOpen, setPasswordOtpModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deleteOtpModalOpen, setDeleteOtpModalOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (passwordOtpModalOpen && !updatePasswordMutation.isPending) {
        setPasswordOtpModalOpen(false);
      }
      if (deleteOtpModalOpen && !deleteAccountMutation.isPending) {
        setDeleteOtpModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    passwordOtpModalOpen,
    deleteOtpModalOpen,
    updatePasswordMutation.isPending,
    deleteAccountMutation.isPending,
  ]);

  const handleConfirmSendPasswordOtp = async () => {
    setPasswordError(null);
    try {
      const res = await sendPasswordOtpMutation.mutateAsync();
      toast.success(res.message || `OTP sent to ${email}`);
      onClosePasswordWarning();
      setCode("");
      setPassword("");
      setConfirmPassword("");
      setPasswordOtpModalOpen(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send password OTP."
      );
    }
  };

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 6) {
      setPasswordError("Enter the 6-character OTP code sent to your email.");
      return;
    }
    if (password.length < 8 || password.length > 72) {
      setPasswordError("Password must be between 8 and 72 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Password and confirm password do not match.");
      return;
    }

    try {
      const res = await updatePasswordMutation.mutateAsync({
        code: normalizedCode,
        newPassword: password,
      });
      toast.success(res.message || "Password updated successfully.");
      setPasswordOtpModalOpen(false);
      setCode("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to update password."
      );
    }
  };

  const handleConfirmSendDeleteOtp = async () => {
    setDeleteError(null);
    try {
      const res = await sendDeleteOtpMutation.mutateAsync();
      toast.success(res.message || `Deletion OTP sent to ${email}`);
      onCloseDeleteWarning();
      setDeleteCode("");
      setDeleteOtpModalOpen(true);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send deletion OTP."
      );
    }
  };

  const handleSubmitDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    const normalizedCode = deleteCode.trim().toUpperCase();
    if (normalizedCode.length !== 6) {
      setDeleteError("Enter the 6-character deletion code sent to your email.");
      return;
    }

    try {
      const res = await deleteAccountMutation.mutateAsync({
        code: normalizedCode,
      });
      setDeleteOtpModalOpen(false);
      setDeleteCode("");
      await onAccountDeleted(res.message);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account."
      );
    }
  };

  return (
    <>
      {/* Step 1: Change Password Warning */}
      <ConfirmModal
        open={passwordWarningOpen}
        onClose={() =>
          !sendPasswordOtpMutation.isPending && onClosePasswordWarning()
        }
        onConfirm={() => void handleConfirmSendPasswordOtp()}
        title="Send password reset OTP?"
        description={`We will send a 6-character verification code to ${email} so you can set or update your password.`}
        highlightText={email}
        confirmLabel="Send OTP"
        cancelLabel="Cancel"
        isLoading={sendPasswordOtpMutation.isPending}
        disableBackdropClose={sendPasswordOtpMutation.isPending}
      />

      {/* Step 2: Enter OTP + Password + Confirm Password */}
      <AnimatePresence>
        {passwordOtpModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-modal-title"
          >
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() =>
                !updatePasswordMutation.isPending && setPasswordOtpModalOpen(false)
              }
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.96, y: 8 }
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
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-amber-400/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  <h2
                    id="change-password-modal-title"
                    className="text-base font-bold text-slate-100"
                  >
                    Verify OTP &amp; Set Password
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordOtpModalOpen(false)}
                  disabled={updatePasswordMutation.isPending}
                  aria-label="Close modal"
                  className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {passwordError && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/40 px-3.5 py-2 text-xs font-medium text-rose-200"
                >
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleSubmitNewPassword} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="modal-otp-code"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    OTP Code *
                  </label>
                  <input
                    id="modal-otp-code"
                    type="text"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      if (passwordError) setPasswordError(null);
                    }}
                    disabled={updatePasswordMutation.isPending}
                    placeholder="6-character code"
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm uppercase tracking-widest text-slate-100 placeholder:text-neutral-500 placeholder:tracking-normal focus:border-amber-400/70 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-new-password"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    New Password *
                  </label>
                  <input
                    id="modal-new-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    disabled={updatePasswordMutation.isPending}
                    placeholder="Min 8 characters"
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-500 focus:border-amber-400/70 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-confirm-password"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="modal-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    disabled={updatePasswordMutation.isPending}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-500 focus:border-amber-400/70 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPasswordOtpModalOpen(false)}
                    disabled={updatePasswordMutation.isPending}
                    className="cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
                  >
                    {updatePasswordMutation.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Step 1: Delete Account Warning */}
      <ConfirmModal
        open={deleteWarningOpen}
        onClose={() =>
          !sendDeleteOtpMutation.isPending && onCloseDeleteWarning()
        }
        onConfirm={() => void handleConfirmSendDeleteOtp()}
        title="Delete your account?"
        description="Deleting your account removes all chips, wallet balances, and gameplay data in the background, and no tokens or chips will be issued or restored. Confirm to receive a deletion OTP."
        highlightText={email}
        variant="danger"
        confirmLabel="Send Deletion OTP"
        cancelLabel="Cancel"
        isLoading={sendDeleteOtpMutation.isPending}
        disableBackdropClose={sendDeleteOtpMutation.isPending}
      />

      {/* Step 2: Enter Deletion OTP */}
      <AnimatePresence>
        {deleteOtpModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-otp-modal-title"
          >
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() =>
                !deleteAccountMutation.isPending && setDeleteOtpModalOpen(false)
              }
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, scale: 0.96, y: 8 }
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
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-rose-500/35 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <h2
                    id="delete-otp-modal-title"
                    className="text-base font-bold text-slate-100"
                  >
                    Confirm Account Deletion
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteOtpModalOpen(false)}
                  disabled={deleteAccountMutation.isPending}
                  aria-label="Close modal"
                  className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200 disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                Enter the 6-character code sent to{" "}
                <span className="font-mono text-slate-200">{email}</span> to
                permanently delete this account.
              </p>

              {deleteError && (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-rose-500/35 bg-rose-950/40 px-3.5 py-2 text-xs font-medium text-rose-200"
                >
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleSubmitDeleteAccount} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="modal-delete-otp"
                    className="mb-1.5 block text-xs font-medium text-neutral-300"
                  >
                    Deletion OTP Code *
                  </label>
                  <input
                    id="modal-delete-otp"
                    type="text"
                    maxLength={6}
                    required
                    value={deleteCode}
                    onChange={(e) => {
                      setDeleteCode(e.target.value.toUpperCase());
                      if (deleteError) setDeleteError(null);
                    }}
                    disabled={deleteAccountMutation.isPending}
                    placeholder="6-character code"
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 font-mono text-sm uppercase tracking-widest text-slate-100 placeholder:text-neutral-500 placeholder:tracking-normal focus:border-rose-400/70 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteOtpModalOpen(false)}
                    disabled={deleteAccountMutation.isPending}
                    className="cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleteAccountMutation.isPending}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-60"
                  >
                    {deleteAccountMutation.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    <span>Delete Account</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}