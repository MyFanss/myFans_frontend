import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages } from '@/lib/api/messages';
import { queryKeys } from '@/lib/query-keys';
import { Message, OptimisticMessage } from '@/types/messages';
import { dedupeMessages } from '@/lib/messages/optimistic';
import { useCallback } from 'react';

export function useMessages(threadId: string | null) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: threadId ? queryKeys.messages.messages(threadId) : [],
    queryFn: async ({ pageParam }) => {
      if (!threadId) throw new Error('Thread ID required');
      return getMessages(threadId, pageParam, 30);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!threadId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  const messages = query.data?.pages.flatMap(page => page.messages) ?? [];

  // Add optimistic messages from cache
  const getOptimisticMessages = useCallback(() => {
    if (!threadId) return [];

    const cache = queryClient.getQueryData<{
      optimisticMessages: OptimisticMessage[];
    }>(queryKeys.messages.messages(threadId));

    return cache?.optimisticMessages ?? [];
  }, [threadId, queryClient]);

  const optimisticMessages = getOptimisticMessages();

  // Combine and dedupe messages
  const allMessages = dedupeMessages(optimisticMessages, messages);

  // Add optimistic message to cache
  const addOptimisticMessage = useCallback(
    (message: OptimisticMessage) => {
      if (!threadId) return;

      queryClient.setQueryData<{
        optimisticMessages: OptimisticMessage[];
      }>(queryKeys.messages.messages(threadId), old => ({
        optimisticMessages: [message, ...(old?.optimisticMessages ?? [])],
      }));
    },
    [threadId, queryClient]
  );

  // Reconcile optimistic message with server response
  const reconcileMessage = useCallback(
    (clientId: string, serverMessage: Message) => {
      if (!threadId) return;

      queryClient.setQueryData<{
        optimisticMessages: OptimisticMessage[];
      }>(queryKeys.messages.messages(threadId), old => ({
        optimisticMessages:
          old?.optimisticMessages.map(msg =>
            msg.clientId === clientId
              ? {
                  ...serverMessage,
                  isOptimistic: false,
                  isPending: false,
                }
              : msg
          ) ?? [],
      }));

      // Also invalidate the actual messages query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.messages(threadId),
      });
    },
    [threadId, queryClient]
  );

  // Mark optimistic message as failed
  const markMessageFailed = useCallback(
    (clientId: string) => {
      if (!threadId) return;

      queryClient.setQueryData<{
        optimisticMessages: OptimisticMessage[];
      }>(queryKeys.messages.messages(threadId), old => ({
        optimisticMessages:
          old?.optimisticMessages.map(msg =>
            msg.clientId === clientId
              ? {
                  ...msg,
                  failedToSend: true,
                  isPending: false,
                }
              : msg
          ) ?? [],
      }));
    },
    [threadId, queryClient]
  );

  return {
    ...query,
    messages: allMessages,
    addOptimisticMessage,
    reconcileMessage,
    markMessageFailed,
  };
}

// Get flattened messages with deduplication
export function useMessagesList(threadId: string | null) {
  const query = useMessages(threadId);

  return {
    ...query,
    isEmpty: query.messages.length === 0,
    isInitialLoading: query.isLoading && !query.data,
  };
}
