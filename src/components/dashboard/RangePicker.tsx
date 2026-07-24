"use client";

import { cn } from "@/lib/utils";
import type { AnalyticsRange } from "@/types/analytics";

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

interface RangePickerProps {
  /** Currently selected range */
  value: AnalyticsRange;
  /** Called when user picks a new range */
  onChange: (range: AnalyticsRange) => void;
  /** Disable the picker while data is loading */
  disabled?: boolean;
  className?: string;
}

/**
 * RangePicker — segmented control for analytics date ranges.
 *
 * Changing the range triggers a TanStack Query refetch via the
 * updated query key — no page reload necessary.
 */
export default function RangePicker({
  value,
  onChange,
  disabled = false,
  className,
}: RangePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Analytics date range"
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted/40 p-0.5",
        className,
      )}
    >
      {RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
