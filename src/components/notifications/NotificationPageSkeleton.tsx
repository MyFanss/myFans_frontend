'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function NotificationPageSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto divide-y">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="px-6 py-4 space-y-3">
            <div className="flex gap-3">
              <Skeleton className="size-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
