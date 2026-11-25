import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, LifeBuoy, Send } from "lucide-react";
import { useCreateSupportTicket } from "../../hooks/useSupportTickets";
import { applyBackendFieldErrors } from "../../utils/apiError";
import { createSupportTicketSchema, type CreateSupportTicketFormValues } from "../../schema/support.schema";
import type { TicketCategory } from "../../types/support";

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "PAYMENT_OR_CHIPS", label: "Payment & Chips" },
  { value: "GAMEPLAY_OR_ROOM", label: "Gameplay & Rooms" },
  { value: "ACCOUNT", label: "Account & Security" },
  { value: "BUG_REPORT", label: "Bug Report" },
  { value: "OTHER", label: "Other Query" },
];

export function RaiseTicketForm() {
  const [submitBanner, setSubmitBanner] = useState<string | null>(null);
  const createTicket = useCreateSupportTicket();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSupportTicketFormValues>({
    resolver: zodResolver(createSupportTicketSchema),
    defaultValues: {
      subject: "",
      category: "OTHER",
      message: "",
    },
  });

  const messageValue = watch("message") ?? "";
  const subjectValue = watch("subject") ?? "";

  const onSubmit = async (values: CreateSupportTicketFormValues) => {
    setSubmitBanner(null);
    try {
      const created = await createTicket.mutateAsync(values);
      reset({ subject: "", category: values.category, message: "" });
      setSubmitBanner(
        `Ticket "${created.subject}" submitted. Our admin team will review and respond soon.`
      );
    } catch (err) {
      const hasFieldErrors = applyBackendFieldErrors(err, setError);
      if (!hasFieldErrors) {
        setError("root", {
          type: "server",
          message:
            err instanceof Error ? err.message : "Could not submit your query.",
        });
      }
    }
  };

  const busy = isSubmitting || createTicket.isPending;

  return (
    <section className="rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-5 shadow-xl shadow-black/35 sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
          <LifeBuoy className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
            Raise a Ticket
          </div>
          <h2 className="text-base font-bold text-white sm:text-lg">
            Ask Admin for Help
          </h2>
        </div>
      </div>

      {submitBanner && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3.5 py-3 text-xs text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <span>{submitBanner}</span>
        </div>
      )}

      {errors.root?.message && (
        <div className="mb-4 rounded-xl border border-rose-500/35 bg-rose-500/10 px-3.5 py-3 text-xs text-rose-200">
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="ticket-category"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300"
          >
            Category
          </label>
          <select
            id="ticket-category"
            {...register("category")}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-amber-400/60"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category?.message && (
            <p className="mt-1 text-xs text-rose-400">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="ticket-subject"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
            >
              Subject
            </label>
            <span className="font-mono text-[11px] text-zinc-500">
              {subjectValue.length}/160
            </span>
          </div>
          <input
            id="ticket-subject"
            type="text"
            placeholder="Brief summary of your issue or question"
            {...register("subject")}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-400/60"
          />
          {errors.subject?.message && (
            <p className="mt-1 text-xs text-rose-400">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label
              htmlFor="ticket-message"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-300"
            >
              Details
            </label>
            <span className="font-mono text-[11px] text-zinc-500">
              {messageValue.length}/5000
            </span>
          </div>
          <textarea
            id="ticket-message"
            rows={5}
            placeholder="Describe what happened, any round/order details, or what you need help with..."
            {...register("message")}
            className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/90 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-400/60"
          />
          {errors.message?.message && (
            <p className="mt-1 text-xs text-rose-400">
              {errors.message.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>{busy ? "Submitting Ticket..." : "Submit Ticket"}</span>
        </button>
      </form>
    </section>
  );
}