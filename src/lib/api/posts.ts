import { api } from "@/lib/api/client";
import type { CreatePostInput } from "@/lib/validations/post";
import type { Post } from "@/types/api";

export function createPost(input: CreatePostInput): Promise<Post> {
  return api.post<Post>("/posts", {
    title: input.title,
    body: input.body,
    visibility: input.visibility,
    mediaUrl: input.mediaUrl || undefined,
  });
}

export function listPosts(): Promise<Post[]> {
  return api.get<Post[]>("/posts");
}
