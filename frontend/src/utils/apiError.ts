import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export interface BackendApiError {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: Record<string, string>;
}

export function extractBackendMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null) {
    const anyErr = err as {
      response?: { data?: BackendApiError };
      message?: string;
    };
    const data = anyErr.response?.data;
    if (data?.message) return data.message;
    if (data?.fieldErrors) {
      const firstFieldMsg = Object.values(data.fieldErrors).find(Boolean);
      if (firstFieldMsg) return firstFieldMsg;
    }
    if (data?.error) return data.error;
    if (anyErr.message) return anyErr.message;
  }
  return fallback;
}

export function applyBackendFieldErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>
): boolean {
  if (typeof err !== "object" || err === null) return false;

  const anyErr = err as {
    response?: { data?: BackendApiError };
  };
  const fieldErrors = anyErr.response?.data?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return false;

  let applied = false;
  for (const [field, message] of Object.entries(fieldErrors)) {
    if (message) {
      setError(field as Path<T>, { type: "server", message });
      applied = true;
    }
  }
  return applied;
}