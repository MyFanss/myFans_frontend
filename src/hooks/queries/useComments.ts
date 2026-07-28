import { useInfiniteQuery } from "@tanstack/react-query";
import { getComments } from "@/lib/api/interactions";
import { queryKeys } from "@/lib/query-keys";
import type { Comment } from "@/types/api";

export function useComments(postId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.interactions.comments(postId),
    queryFn: async ({ pageParam }) => {
      return getComments({
        postId,
        cursor: pageParam,
        limit: 20,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
    select: (data) => {
      const comments: Comment[] = [];
      const seen = new Set<string>();

      for (const page of data.pages) {
        for (const comment of page.comments) {
          if (!seen.has(comment.id)) {
            comments.push(comment);
            seen.add(comment.id);
          }
        }
      }

      return { comments };
    },
  });
}
