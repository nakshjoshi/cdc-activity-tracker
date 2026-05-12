"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useOptimistic } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, Calendar, Loader2 } from "lucide-react";

const TABS = [
  { key: "overdue", label: "Overdue", icon: AlertCircle },
  { key: "today", label: "Today", icon: Clock },
  { key: "upcoming", label: "Next 7 Days", icon: Calendar },
] as const;

interface FollowupTabsProps {
  counts: { overdue: number; today: number; upcoming: number };
}

export function FollowupTabs({ counts }: FollowupTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "overdue";
  const [isPending, startTransition] = useTransition();
  const [optimisticTab, setOptimisticTab] = useOptimistic(currentTab);

  const handleClick = (key: string) => {
    setOptimisticTab(key);
    startTransition(() => {
      router.push(`/dashboard/followups?tab=${key}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = optimisticTab === t.key;
        const count = counts[t.key];
        return (
          <button
            key={t.key}
            onClick={() => handleClick(t.key)}
            disabled={isPending && optimisticTab !== t.key}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150",
              isActive
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700",
              isPending && !isActive && "opacity-50 cursor-wait"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
            <span
              className={cn(
                "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none",
                isActive ? "bg-white/20" : "bg-zinc-700/60"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500 ml-1" />
      )}
    </div>
  );
}
