'use client';

import { Thread } from '@/types/messages';
import { ThreadDetail } from './ThreadDetail';
import { MessageThreadSkeleton } from './MessageThreadSkeleton';
import { useRouter } from 'next/navigation';

interface MessageThreadProps {
  threadId: string;
  thread?: Thread;
  isLoading: boolean;
}

export function MessageThread({ threadId, thread, isLoading }: MessageThreadProps) {
  const router = useRouter();

  if (isLoading) {
    return <MessageThreadSkeleton />;
  }

  return (
    <ThreadDetail
      threadId={threadId}
      onBack={() => router.push('/messages')}
    />
  );
}
