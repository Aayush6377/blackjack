import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ReplayPaginationBarProps {
  page: number; 
  limit: number;
  totalElements: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (nextPage: number) => void;
}

export function ReplayPaginationBar({
  page,
  limit,
  totalElements,
  totalPages,
  hasPrevious,
  hasNext,
  onPageChange,
}: ReplayPaginationBarProps) {
  if (totalElements === 0) return null;

  const startItem = page * limit + 1;
  const endItem = Math.min((page + 1) * limit, totalElements);

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-zinc-800/90 bg-zinc-950/85 px-4 py-3.5 sm:flex-row sm:px-5">
      <p className="text-xs text-zinc-400">
        Showing <span className="font-semibold text-zinc-200">{startItem}</span>–
        <span className="font-semibold text-zinc-200">{endItem}</span> of{" "}
        <span className="font-semibold text-amber-300">{totalElements}</span> rounds ·
        Page <span className="font-semibold text-white">{page + 1}</span> of{" "}
        <span className="font-semibold text-white">{Math.max(totalPages, 1)}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(0)}
          aria-label="First page"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          aria-label="Previous page"
          className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </button>

        <span className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 text-xs font-bold text-amber-300">
          {page + 1}
        </span>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(Math.max(totalPages - 1, 0))}
          aria-label="Last page"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-amber-400/50 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}