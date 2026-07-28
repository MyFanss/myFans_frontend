'use client';

import { OptimisticMessage } from '@/types/messages';
import { MessageBubble } from './MessageBubble';
import { groupMessagesByDay } from '@/lib/messages/optimistic';
import { useAuth } from '@/hooks/useAuth';
import { MessageListSkeleton } from './MessageListSkeleton';
import { useEffect, useRef } from 'react';

interface MessageListProps {
  messages: OptimisticMessage[];
  isLoading: boolean;
  threadId: string;
}

export function MessageList({ messages, isLoading, threadId }: MessageListProps) {
  const { user } = useAuth();
  const endRef = useRef<HTMLDivElement>(null);

  const groups = groupMessagesByDay(messages);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return <MessageListSkeleton />;
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      role="log"
      aria-live="polite"
      aria-label="Messages"
    >
      {groups.map((group) => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground px-2">{group.date}</span>
            <div className="flex-1 border-t" />
          </div>

          {/* Messages in this day */}
          {group.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={user?.id === msg.senderId}
            />
          ))}
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={endRef} />

      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}
