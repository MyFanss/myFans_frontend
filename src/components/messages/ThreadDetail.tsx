'use client';

import { MessageThreadHeader } from './MessageThreadHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { useThread } from '@/hooks/useThreads';
import { useMessages } from '@/hooks/useMessages';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useMarkThreadRead } from '@/hooks/useMarkThreadRead';

interface ThreadDetailProps {
  threadId: string;
  onBack?: () => void;
}

export function ThreadDetail({ threadId, onBack }: ThreadDetailProps) {
  const { data: thread, isLoading: threadLoading } = useThread(threadId);
  const { messages, isLoading: messagesLoading } = useMessages(threadId);
  const { send, isPending } = useSendMessage(threadId);
  useMarkThreadRead(threadId); // Auto-mark as read

  if (threadLoading) {
    return <div className="flex items-center justify-center h-full">Loading thread...</div>;
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold">Thread not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            This conversation may have been deleted
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Go back to conversations
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageThreadHeader thread={thread} onBack={onBack} />
      <MessageList
        messages={messages}
        isLoading={messagesLoading}
        threadId={threadId}
      />
      <MessageComposer
        threadId={threadId}
        onSend={send}
        isPending={isPending}
        isThreadBlocked={thread.isBlocked}
        isParticipantDeleted={thread.participantDeleted}
      />
    </div>
  );
}
