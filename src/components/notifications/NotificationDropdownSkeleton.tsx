'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface NotificationDropdownSkeletonProps {
  count?: number;
}

export function NotificationDropdownSkeleton({ count = 5 }: NotificationDropdownSkeletonProps) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-4 py-3 space-y-2">
          <div className="flex gap-3">
            <Skeleton className="size-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
