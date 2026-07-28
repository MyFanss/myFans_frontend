import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markThreadRead } from '@/lib/api/messages';
import { queryKeys } from '@/lib/query-keys';
import { useEffect, useRef } from 'react';

const MARK_READ_DEBOUNCE = 500; // ms

export function useMarkThreadRead(threadId: string | null) {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await markThreadRead(id);
    },

    onSuccess: (_, threadId) => {
      // Update thread in cache
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
                      unreadCount: 0,
                    }
                  : thread
              ),
            })),
          };
        }
      );

      // Also update single thread if cached
      queryClient.setQueryData(
        queryKeys.messages.thread(threadId),
        (old: any) =>
          old
            ? {
                ...old,
                unreadCount: 0,
              }
            : old
      );
    },
  });

  const markRead = (id: string) => {
    // Debounce the mark read call
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      mutation.mutate(id);
    }, MARK_READ_DEBOUNCE);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Auto-mark as read when thread opens
  useEffect(() => {
    if (threadId) {
      markRead(threadId);
    }
  }, [threadId]);

  return mutation;
}

// Hook to track which threads have been opened (for marking read)
export function useThreadOpenTracker() {
  const openThreadsRef = useRef<Set<string>>(new Set());

  const markThreadOpened = (threadId: string) => {
    openThreadsRef.current.add(threadId);
  };

  const isThreadOpened = (threadId: string) => {
    return openThreadsRef.current.has(threadId);
  };

  const clearTracking = () => {
    openThreadsRef.current.clear();
  };

  return {
    markThreadOpened,
    isThreadOpened,
    clearTracking,
  };
}
