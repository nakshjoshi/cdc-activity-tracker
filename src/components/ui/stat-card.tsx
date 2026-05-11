import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  className?: string;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  accentColor = "indigo",
}: StatCardProps) {
  const TrendIcon =
    trend && trend.value > 0
      ? TrendingUp
      : trend && trend.value < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend && trend.value > 0
      ? "text-emerald-600"
      : trend && trend.value < 0
      ? "text-red-600"
      : "text-gray-500";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md",
        "dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {/* Background accent */}
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-all group-hover:opacity-15",
          `bg-${accentColor}-500`
        )}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>
          )}
          {trend && (
            <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(trend.value)}% {trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              `bg-${accentColor}-50 text-${accentColor}-600`,
              `dark:bg-${accentColor}-900/30 dark:text-${accentColor}-400`
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
