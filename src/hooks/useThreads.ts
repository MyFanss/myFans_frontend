import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getThreads, getThread } from '@/lib/api/messages';
import { queryKeys } from '@/lib/query-keys';
import { Thread } from '@/types/messages';

export function useThreads(initialCursor?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.threads(),
    queryFn: async ({ pageParam }) => {
      const response = await getThreads(pageParam, 20);
      return response;
    },
    initialPageParam: initialCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useThread(threadId: string | null) {
  return useQuery({
    queryKey: threadId ? queryKeys.messages.thread(threadId) : [],
    queryFn: () => {
      if (!threadId) throw new Error('Thread ID required');
      return getThread(threadId);
    },
    enabled: !!threadId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Get flattened list of threads with deduplication
export function useThreadsList() {
  const query = useThreads();

  const threads = query.data?.pages.flatMap(page => page.threads) ?? [];

  // Deduplicate by ID (keeping first occurrence)
  const seen = new Set<string>();
  const dedupedThreads = threads.filter(thread => {
    if (seen.has(thread.id)) return false;
    seen.add(thread.id);
    return true;
  });

  return {
    ...query,
    threads: dedupedThreads,
    total: dedupedThreads.length,
  };
}

// Search threads locally (can be upgraded to server search)
export function searchThreadsLocal(threads: Thread[], query: string): Thread[] {
  if (!query.trim()) return threads;

  const q = query.toLowerCase();
  return threads.filter(
    thread =>
      thread.participant.displayName.toLowerCase().includes(q) ||
      thread.participant.handle.toLowerCase().includes(q) ||
      thread.lastMessage?.content.toLowerCase().includes(q)
  );
}
