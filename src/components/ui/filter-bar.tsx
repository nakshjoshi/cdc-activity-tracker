"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useOptimistic, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  /** The search param key this filter controls, e.g. "status", "type", "tab" */
  paramKey: string;
  /** Base URL like "/dashboard/companies" */
  baseUrl: string;
  /** Active color class for selected pill, defaults to "bg-blue-600 text-white" */
  activeClass?: string;
}

export function FilterBar({
  options,
  paramKey,
  baseUrl,
  activeClass = "bg-blue-600 text-white",
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramKey) ?? "";
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(currentValue);

  const handleClick = useCallback(
    (value: string) => {
      startTransition(() => {
        // Instant visual switch (must be inside transition)
        setOptimisticValue(value);

        const params = new URLSearchParams(searchParams.toString());
        // Remove page when filter changes (reset to page 1)
        params.delete("page");

        if (value) {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }

        const qs = params.toString();
        router.push(qs ? `${baseUrl}?${qs}` : baseUrl);
      });
    },
    [searchParams, paramKey, baseUrl, router, setOptimisticValue, startTransition]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const isActive = optimisticValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            disabled={isPending && optimisticValue !== opt.value}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150",
              isActive
                ? activeClass
                : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700",
              isPending && !isActive && "opacity-50 cursor-wait"
            )}
          >
            {opt.icon}
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none",
                  isActive ? "bg-white/20" : "bg-zinc-700/60"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}

      {/* Subtle loading indicator */}
      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500 ml-1" />
      )}
    </div>
  );
}
