import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComment } from "@/lib/api/interactions";
import { queryKeys } from "@/lib/query-keys";

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment({ commentId }),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.interactions.comments(postId),
      });

      const previous = queryClient.getQueryData(
        queryKeys.interactions.comments(postId)
      );

      queryClient.setQueryData(
        queryKeys.interactions.comments(postId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: old.comments.map((c: any) =>
              c.id === commentId ? { ...c, deleted: true, body: "[removed]" } : c
            ),
          };
        }
      );

      return { previous };
    },
    onError: (error, commentId, context) => {
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
        statusCode === 403
          ? "You can only delete your own comments."
          : "Failed to delete comment. Please try again.";

      console.error(`Comment deletion error: ${message}`);
    },
  });
}
