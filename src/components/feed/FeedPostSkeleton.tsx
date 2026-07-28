export function FeedPostSkeleton({ withMedia = true }: { withMedia?: boolean }) {
  return (
    <article className="border rounded-lg overflow-hidden bg-card">
      {withMedia && (
        <div className="w-full h-48 bg-muted animate-pulse" style={{ aspectRatio: "16/9" }} />
      )}

      <div className="p-4 space-y-4">
        {/* Author skeleton */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            <div className="h-2 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>

        {/* Body skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted animate-pulse rounded" />
          <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
        </div>

        {/* Meta skeleton */}
        <div className="h-2 w-20 bg-muted animate-pulse rounded" />

        {/* Actions skeleton */}
        <div className="flex gap-2 pt-3 border-t">
          <div className="flex-1 h-8 bg-muted animate-pulse rounded" />
          <div className="flex-1 h-8 bg-muted animate-pulse rounded" />
          <div className="flex-1 h-8 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </article>
  );
}

export function FeedPostSkeletonGroup({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FeedPostSkeleton key={i} withMedia={i % 2 === 0} />
      ))}
    </div>
  );
}
