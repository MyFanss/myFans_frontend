import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api/posts";
import { queryKeys } from "@/lib/query-keys";
import type { Post } from "@/types/api";

export function useCreatePost(options?: { onSuccess?: (post: Post) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      options?.onSuccess?.(post);
    },
  });
}
