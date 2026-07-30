export function PostListSkeleton() {
  return (
    <div className="rounded-lg border p-4" aria-hidden="true">
      <div className="flex items-center justify-between gap-2">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="mt-3 h-4 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function PostListSkeletonGroup({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-4" aria-label="Loading posts" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index}>
          <PostListSkeleton />
        </li>
      ))}
    </ul>
  );
}
