'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function MessageThreadSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Messages */}
      <MessageListSkeleton />

      {/* Composer */}
      <div className="border-t p-4 space-y-2">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

import { MessageListSkeleton } from './MessageListSkeleton';
