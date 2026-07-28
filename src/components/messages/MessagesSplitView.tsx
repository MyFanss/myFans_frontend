'use client';

import { Thread } from '@/types/messages';
import { ThreadList } from './ThreadList';
import { ThreadDetail } from './ThreadDetail';
import { MessageThreadSkeleton } from './MessageThreadSkeleton';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MessagesSplitViewProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  isLoading: boolean;
}

export function MessagesSplitView({
  threads,
  selectedThreadId,
  onSelectThread,
  isLoading,
}: MessagesSplitViewProps) {
  const isMobile = !useMediaQuery('(min-width: 1024px)');

  if (isMobile) {
    // Mobile: Stack view (show list OR detail)
    if (selectedThreadId) {
      return (
        <ThreadDetail
          threadId={selectedThreadId}
          onBack={() => onSelectThread(null)}
        />
      );
    }

    return (
      <ThreadList
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={onSelectThread}
        isLoading={isLoading}
      />
    );
  }

  // Desktop: Split view
  return (
    <div className="flex h-full gap-0">
      {/* Thread List */}
      <div className="w-96 border-r bg-background">
        <ThreadList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelectThread={onSelectThread}
          isLoading={isLoading}
        />
      </div>

      {/* Thread Detail */}
      <div className="flex-1 bg-background">
        {selectedThreadId ? (
          <ThreadDetail threadId={selectedThreadId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a thread to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
