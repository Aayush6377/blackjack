import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ImagePlus, Link2, Upload, X } from "lucide-react";

export interface MediaSelectionDraft {
  mode: "url" | "file";
  url: string;
  file: File | null;
  previewUrl: string | null;
}

export interface RoomMediaPickerModalProps {
  open: boolean;
  label: string;
  initialUrl?: string | null;
  initialFile?: File | null;
  onClose: () => void;
  onConfirm: (selection: MediaSelectionDraft) => void;
}

export function RoomMediaPickerModal({
  open,
  label,
  initialUrl,
  initialFile,
  onClose,
  onConfirm,
}: RoomMediaPickerModalProps) {
  const prefersReducedMotion = useReducedMotion();

  const [mode, setMode] = useState<"url" | "file">("url");
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ownedObjectUrlRef = useRef<string | null>(null);

  const setManagedPreview = (nextUrl: string | null) => {
    if (ownedObjectUrlRef.current && ownedObjectUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(ownedObjectUrlRef.current);
      ownedObjectUrlRef.current = null;
    }
    setFilePreview(nextUrl);
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initialFile) {
      setMode("file");
      setFileInput(initialFile);
      setUrlInput("");
      const objectUrl = URL.createObjectURL(initialFile);
      ownedObjectUrlRef.current = objectUrl;
      setFilePreview(objectUrl);
    } else {
      setMode("url");
      setUrlInput(initialUrl ?? "");
      setFileInput(null);
      setManagedPreview(null);
    }
  }, [open, initialUrl, initialFile]);

  useEffect(() => {
    return () => {
      if (ownedObjectUrlRef.current) {
        URL.revokeObjectURL(ownedObjectUrlRef.current);
        ownedObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleFileChange = (file: File | null) => {
    setError(null);
    if (!file) {
      setFileInput(null);
      setManagedPreview(null);
      return;
    }
    setFileInput(file);
    const objectUrl = URL.createObjectURL(file);
    ownedObjectUrlRef.current = objectUrl;
    setFilePreview(objectUrl);
  };

  const confirmSelection = () => {
    if (mode === "url") {
      const trimmed = urlInput.trim();
      if (!trimmed) {
        setError("Please enter an image URL or switch to file upload.");
        return;
      }
      onConfirm({
        mode: "url",
        url: trimmed,
        file: null,
        previewUrl: trimmed,
      });
      onClose();
      return;
    }

    if (!fileInput) {
      setError("Please select an image file to upload.");
      return;
    }

    const confirmedPreview = filePreview;
    ownedObjectUrlRef.current = null;

    onConfirm({
      mode: "file",
      url: "",
      file: fileInput,
      previewUrl: confirmedPreview,
    });
    onClose();
  };

  const activePreview = mode === "file" ? filePreview : urlInput.trim() || null;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-media-modal-title"
        >
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
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
            className="relative z-10 w-full max-w-lg rounded-2xl border border-amber-400/25 bg-neutral-900 p-6 text-slate-100 shadow-2xl shadow-black/80"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2
                  id="room-media-modal-title"
                  className="text-base font-bold text-slate-100"
                >
                  Select {label}
                </h2>
                <p className="text-xs text-neutral-400">
                  Changes apply to the form now and upload/save when you submit
                  the room.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close image picker"
                className="cursor-pointer rounded-lg p-1.5 text-neutral-400 transition hover:bg-neutral-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/35 bg-rose-950/40 px-3.5 py-2 text-xs font-medium text-rose-200"
              >
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-neutral-800 bg-neutral-950/80 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("url");
                    setError(null);
                  }}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                    mode === "url"
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-400 hover:text-slate-200"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("file");
                    setError(null);
                  }}
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${
                    mode === "file"
                      ? "bg-amber-500 text-neutral-950"
                      : "text-neutral-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              {mode === "url" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                    {label} URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setError(null);
                    }}
                    placeholder="https://example.com/room-image.webp"
                    className="w-full rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3.5 py-2 text-sm text-slate-100 placeholder:text-neutral-600 focus:border-amber-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                    Choose File (JPEG, PNG, WEBP — max 5 MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] ?? null)
                    }
                    className="block w-full cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-950/85 px-3 py-2 text-xs text-slate-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-amber-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-300 hover:file:bg-amber-500/25"
                  />
                </div>
              )}

              <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Preview
                </div>
                {activePreview ? (
                  <img
                    src={activePreview}
                    alt={`${label} preview`}
                    className="h-36 w-full rounded-lg border border-neutral-800 object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-500">
                    <ImagePlus className="mb-1 h-5 w-5 text-neutral-600" />
                    <span>No preview available</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSelection}
                  className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
                >
                  Confirm Selection
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}