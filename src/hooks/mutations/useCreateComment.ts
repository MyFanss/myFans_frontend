import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/lib/api/interactions";
import { queryKeys } from "@/lib/query-keys";
import type { Comment } from "@/types/api";

export interface UseCreateCommentParams {
  postId: string;
  onSuccess?: (comment: Comment) => void;
}

export function useCreateComment({ postId, onSuccess }: UseCreateCommentParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { body: string; parentId?: string }) =>
      createComment({ postId, ...input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.interactions.comments(postId),
      });

      const previous = queryClient.getQueryData(
        queryKeys.interactions.comments(postId)
      );

      const optimisticComment: Comment = {
        id: `temp_${Date.now()}`,
        postId,
        author: {
          id: "current-user",
          name: "You",
          handle: "you",
        },
        body: input.body,
        createdAt: new Date().toISOString(),
        parentId: input.parentId,
        likeCount: 0,
        likedByMe: false,
        deleted: false,
      };

      queryClient.setQueryData(
        queryKeys.interactions.comments(postId),
        (old: any) => {
          if (!old) return { comments: [optimisticComment] };
          return {
            ...old,
            comments: [optimisticComment, ...(old.comments || [])],
          };
        }
      );

      return { previous, optimisticId: optimisticComment.id };
    },
    onError: (error, input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.interactions.comments(postId),
          context.previous
        );
      }

      const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : null;
      if (statusCode === 401) {
        return;
      }

      const message =
        statusCode === 429
          ? "Too many requests. Please wait before commenting."
          : "Failed to post comment. Please try again.";

      console.error(`Comment creation error: ${message}`);
    },
    onSuccess: (comment, input, context) => {
      queryClient.setQueryData(
        queryKeys.interactions.comments(postId),
        (old: any) => {
          if (!old) return { comments: [comment] };
          return {
            ...old,
            comments: old.comments.map((c: Comment) =>
              c.id === context?.optimisticId ? comment : c
            ),
          };
        }
      );

      onSuccess?.(comment);
    },
  });
}
