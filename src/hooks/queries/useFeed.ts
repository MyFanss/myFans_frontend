import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeed } from "@/lib/api/feed";
import { queryKeys } from "@/lib/query-keys";
import type { FeedFilter } from "@/lib/api/feed";
import type { FeedPost } from "@/types/api";

export function useFeed(filter: FeedFilter = "all") {
  return useInfiniteQuery({
    queryKey: queryKeys.feed.infinite(filter),
    queryFn: async ({ pageParam }) => {
      const response = await getFeed({
        cursor: pageParam,
        limit: 20,
        filter,
      });
      return response;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
    select: (data) => {
      const posts: FeedPost[] = [];
      const seen = new Set<string>();

      for (const page of data.pages) {
        for (const post of page.posts) {
          if (!seen.has(post.id)) {
            posts.push(post);
            seen.add(post.id);
          }
        }
      }

      return { posts };
    },
  });
}
