import { api } from "@/lib/api/client";
import type { FeedPost, FeedResponse } from "@/types/api";

export type FeedFilter = "all" | "media" | "text";

export interface GetFeedOptions {
  cursor?: string;
  limit?: number;
  filter?: FeedFilter;
}

export function getFeed(options: GetFeedOptions = {}): Promise<FeedResponse> {
  const { cursor, limit = 20, filter = "all" } = options;
  return api.get<FeedResponse>("/feed", {
    params: {
      ...(cursor && { cursor }),
      limit,
      filter,
    },
  });
}

export function getFeedPosts(cursor?: string, limit = 20): Promise<FeedPost[]> {
  return api.get<FeedPost[]>("/feed/posts", {
    params: {
      ...(cursor && { cursor }),
      limit,
    },
  });
}
