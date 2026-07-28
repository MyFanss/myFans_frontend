import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/lib/api/messages';
import { queryKeys } from '@/lib/query-keys';
import { createOptimisticMessage, validateMessage } from '@/lib/messages/optimistic';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useSendMessage(threadId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({
      content,
      clientId,
      attachmentIds,
    }: {
      content: string;
      clientId: string;
      attachmentIds?: string[];
    }) => {
      // Validate
      const validation = validateMessage(content);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (!threadId) {
        throw new Error('Thread ID required');
      }

      // Send to server
      const response = await sendMessage(threadId, content, clientId, attachmentIds);
      return response;
    },

    onMutate: async ({ content, clientId, attachmentIds }) => {
      if (!threadId || !user) throw new Error('Missing context');

      // Optimistic update: add message to cache immediately
      const optimisticMessage = createOptimisticMessage(
        threadId,
        content,
        user.id,
        clientId
      );

      // Update optimistic messages cache
      queryClient.setQueryData<{ optimisticMessages: any[] }>(
        queryKeys.messages.messages(threadId),
        old => ({
          optimisticMessages: [optimisticMessage, ...(old?.optimisticMessages ?? [])],
        })
      );

      // Update thread's lastMessage (optimistic)
      queryClient.setQueriesData(
        { queryKey: queryKeys.messages.threads() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              threads: page.threads.map((thread: any) =>
                thread.id === threadId
                  ? {
                      ...thread,
                      lastMessage: optimisticMessage,
                      lastMessageAt: optimisticMessage.createdAt,
                    }
                  : thread
              ),
            })),
          };
        }
      );

      return { clientId };
    },

    onSuccess: (response, variables, context) => {
      const clientId = context?.clientId;
      if (!threadId || !clientId) return;

      // Reconcile optimistic message with server response
      queryClient.setQueryData<{ optimisticMessages: any[] }>(
        queryKeys.messages.messages(threadId),
        old => ({
          optimisticMessages:
            old?.optimisticMessages.map(msg =>
              msg.clientId === clientId
                ? {
                    ...response.message,
                    isOptimistic: false,
                    isPending: false,
                  }
                : msg
            ) ?? [],
        })
      );

      // Invalidate to refetch latest
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.messages(threadId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.threads(),
      });
    },

    onError: (error, variables, context) => {
      const clientId = context?.clientId;
      if (!threadId || !clientId) return;

      // Mark message as failed
      queryClient.setQueryData<{ optimisticMessages: any[] }>(
        queryKeys.messages.messages(threadId),
        old => ({
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
        })
      );
    },
  });

  const send = useCallback(
    (content: string, attachmentIds?: string[]) => {
      const clientId = `msg-${threadId}-${Date.now()}-${Math.random()}`;
      return mutation.mutate({
        content,
        clientId,
        attachmentIds,
      });
    },
    [mutation, threadId]
  );

  const retry = useCallback(
    (content: string, attachmentIds?: string[]) => {
      const clientId = `retry-${threadId}-${Date.now()}-${Math.random()}`;
      return mutation.mutate({
        content,
        clientId,
        attachmentIds,
      });
    },
    [mutation, threadId]
  );

  return {
    send,
    retry,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
