import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Base URL like "/dashboard/companies" */
  baseUrl: string;
  /** Extra search params to preserve, e.g. { status: "ACTIVE", search: "foo" } */
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  }

  // Generate page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-xs text-zinc-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700">
            <ChevronLeft className="h-4 w-4" />
          </div>
        )}

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-zinc-500">
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildUrl(p)}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors px-2",
                p === currentPage
                  ? "bg-blue-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              )}
            >
              {p}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700">
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
