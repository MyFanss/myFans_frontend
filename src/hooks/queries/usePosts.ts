import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { listPosts } from "@/lib/api/posts";
import { queryKeys } from "@/lib/query-keys";

export function usePosts() {
  return useQuery({
    queryKey: queryKeys.posts.list(),
    queryFn: () => listPosts(),
    enabled: typeof window !== "undefined" && !!api.getToken(),
  });
}
