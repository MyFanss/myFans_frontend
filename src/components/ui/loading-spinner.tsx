import { cn } from "@/lib/utils"

/**
 * LoadingSpinner — animated ring spinner
 * variant="inline": sized to text flow (use inside buttons or table cells)
 * variant="page": centered full-viewport overlay
 */

interface LoadingSpinnerProps {
  variant?: "inline" | "page"
  size?: "sm" | "md" | "lg"
  className?: string
  label?: string
}

const sizeClasses = {
  sm: "size-4 border-2",
  md: "size-8 border-2",
  lg: "size-12 border-[3px]",
}

export function LoadingSpinner({
  variant = "inline",
  size = "md",
  className,
  label = "Loading…",
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "rounded-full border-current border-t-transparent animate-spin text-primary",
        sizeClasses[size],
        variant === "inline" && className
      )}
    />
  )

  if (variant === "page") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        {spinner}
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      </div>
    )
  }

  return spinner
}
