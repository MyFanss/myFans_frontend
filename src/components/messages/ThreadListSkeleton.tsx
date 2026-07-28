'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface ThreadListSkeletonProps {
  count?: number;
}

export function ThreadListSkeleton({ count = 5 }: ThreadListSkeletonProps) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 space-y-2">
          <div className="flex gap-3">
            <Skeleton className="size-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="size-5 rounded-full flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
