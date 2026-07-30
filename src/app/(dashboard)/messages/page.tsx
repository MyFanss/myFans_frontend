'use client';

import { useState } from 'react';
import { MessagesSplitView } from '@/components/messages/MessagesSplitView';
import { MessagesEmptyState } from '@/components/messages/MessagesEmptyState';
import { useThreadsList } from '@/hooks/useThreads';

export default function MessagesPage() {
  const { threads, isLoading, isError } = useThreadsList();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Unable to load messages</p>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (threads.length === 0 && !isLoading) {
    return <MessagesEmptyState />;
  }

  return (
    <MessagesSplitView
      threads={threads}
      selectedThreadId={selectedThreadId}
      onSelectThread={setSelectedThreadId}
      isLoading={isLoading}
    />
  );
}
