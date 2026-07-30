'use client';

import { MessageThread } from '@/components/messages/MessageThread';
import { useThread } from '@/hooks/useThreads';
import { notFound } from 'next/navigation';

interface MessageThreadPageProps {
  params: {
    threadId: string;
  };
}

export default function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { data: thread, isLoading, isError } = useThread(params.threadId);

  if (isError) {
    notFound();
  }

  return (
    <MessageThread
      threadId={params.threadId}
      thread={thread}
      isLoading={isLoading}
    />
  );
}
