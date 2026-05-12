import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  accentColor?: string;
}

const COLOR_MAP: Record<string, { iconBg: string; iconText: string; bg: string }> = {
  blue:   { iconBg: "bg-blue-950/30",     iconText: "text-blue-400",     bg: "bg-blue-950/300" },
  green:  { iconBg: "bg-green-950/30",    iconText: "text-green-600",   bg: "bg-green-950/300" },
  red:    { iconBg: "bg-red-950/30",        iconText: "text-red-600",       bg: "bg-red-950/300" },
  orange: { iconBg: "bg-orange-950/30",  iconText: "text-orange-600", bg: "bg-orange-950/300" },
  indigo: { iconBg: "bg-indigo-50",  iconText: "text-indigo-600", bg: "bg-indigo-500" },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  className,
  accentColor = "blue",
}: StatCardProps) {
  const colors = COLOR_MAP[accentColor] ?? COLOR_MAP.blue;

  return (
    <div
      className={cn(
        "premium-card p-4 sm:p-5 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {title}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-zinc-100 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              colors.iconBg,
              colors.iconText
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
