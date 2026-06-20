import { cn } from "@/lib/utils"

/**
 * PageSkeleton — shimmer placeholder matching dashboard card dimensions.
 * Renders a stat-card row + a content card block by default.
 * Pass className to override wrapper sizing/layout.
 */

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

interface PageSkeletonProps {
  /** Number of stat cards in the top row */
  statCards?: number
  /** Number of content card rows below */
  contentRows?: number
  className?: string
}

export function PageSkeleton({
  statCards = 4,
  contentRows = 3,
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("w-full space-y-6 p-6", className)}>
      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: statCards }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        ))}
      </div>

      {/* Content card */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3">
          {Array.from({ length: contentRows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Skeleton }
