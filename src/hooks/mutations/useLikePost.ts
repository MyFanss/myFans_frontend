import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/lib/api/interactions";
import { queryKeys } from "@/lib/query-keys";
import { api } from "@/lib/api/client";
import type { FeedPost } from "@/types/api";

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const isLiked = queryClient.getQueryData<{ posts: FeedPost[] }>(
        queryKeys.feed.infinite()
      )?.posts.find((p) => p.id === postId)?.isLiked;

      if (isLiked) {
        return unlikePost({ postId });
      } else {
        return likePost({ postId });
      }
    },
    onMutate: async (postId: string) => {
      // Disable auto-refetch while we update optimistically
      await queryClient.cancelQueries();

      // Get all feed posts and update them
      const feedKey = queryKeys.feed.infinite();
      const previous = queryClient.getQueryData(feedKey);

      queryClient.setQueryData(feedKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: FeedPost) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLiked: !post.isLiked,
                  likeCount: (post.likeCount || 0) + (post.isLiked ? -1 : 1),
                };
              }
              return post;
            }),
          })),
        };
      });

      // Also update in creators detail if post appears there
      const creatorKey = queryKeys.creators.detail("");
      queryClient.setQueriesData(
        { queryKey: creatorKey, exact: false },
        (old: any) => {
          if (!old?.recentPosts) return old;
          return {
            ...old,
            recentPosts: old.recentPosts.map((post: any) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLiked: !post.isLiked,
                  likeCount: (post.likeCount || 0) + (post.isLiked ? -1 : 1),
                };
              }
              return post;
            }),
          };
        }
      );

      return { previous };
    },
    onError: (error, postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.feed.infinite(), context.previous);
      }

      const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : null;
      if (statusCode === 401) {
        // Redirect handled by client middleware
        return;
      }

      const message =
        statusCode === 429
          ? "Too many requests. Please wait before trying again."
          : "Failed to update like. Please try again.";

      console.error(`Like mutation error: ${message}`);
    },
    onSuccess: () => {
      // Invalidate feed to sync with backend
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
    },
  });
}
