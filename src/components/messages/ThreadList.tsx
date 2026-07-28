'use client';

import { useState, useMemo } from 'react';
import { Thread } from '@/types/messages';
import { ThreadListItem } from './ThreadListItem';
import { ThreadListSkeleton } from './ThreadListSkeleton';
import { Input } from '@/components/ui/input';
import { MessageCircle } from 'lucide-react';
import { searchThreadsLocal } from '@/hooks/useThreads';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  isLoading: boolean;
}

export function ThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  isLoading,
}: ThreadListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = useMemo(
    () => searchThreadsLocal(threads, searchQuery),
    [threads, searchQuery]
  );

  if (isLoading) {
    return <ThreadListSkeleton count={5} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="border-b p-3">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="size-12 text-muted-foreground/40 mb-3" />
            <p className="font-medium">No conversations</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? 'No matches found' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div role="tablist" className="divide-y">
            {filteredThreads.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                isSelected={selectedThreadId === thread.id}
                onSelect={() => onSelectThread(thread.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
