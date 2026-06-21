import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/lib/mocks/dashboard";

interface StatCardProps {
  stat: DashboardStat;
}

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
} as const;

const trendColors = {
  up: "text-green-600 dark:text-green-400",
  down: "text-red-600 dark:text-red-400",
  neutral: "text-muted-foreground",
} as const;

export default function StatCard({ stat }: StatCardProps) {
  const TrendIcon = stat.trend ? trendIcons[stat.trend.direction] : null;

  return (
    <article className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
      {stat.trend && TrendIcon && (
        <p
          className={cn(
            "mt-3 flex items-center gap-1 text-xs font-medium",
            trendColors[stat.trend.direction],
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{stat.trend.label}</span>
        </p>
      )}
    </article>
  );
}
