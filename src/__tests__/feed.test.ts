import { describe, it, expect } from "vitest";
import type { FeedPost } from "@/types/api";

// Dedupe utility
function dedupePostsById(posts: FeedPost[]): FeedPost[] {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (seen.has(post.id)) {
      return false;
    }
    seen.add(post.id);
    return true;
  });
}

// Merge pages utility
interface FeedPage {
  posts: FeedPost[];
  cursor?: string;
  hasMore?: boolean;
}

function mergePages(pages: FeedPage[]): FeedPost[] {
  const allPosts: FeedPost[] = [];
  for (const page of pages) {
    allPosts.push(...page.posts);
  }
  return dedupePostsById(allPosts);
}

describe("Feed utilities", () => {
  describe("dedupePostsById", () => {
    it("removes duplicate posts by id", () => {
      const posts: FeedPost[] = [
        {
          id: "1",
          title: "Post 1",
          body: "Body 1",
          visibility: "public",
          authorId: "user1",
          createdAt: "2025-01-01",
        },
        {
          id: "2",
          title: "Post 2",
          body: "Body 2",
          visibility: "public",
          authorId: "user2",
          createdAt: "2025-01-02",
        },
        {
          id: "1",
          title: "Post 1 (duplicate)",
          body: "Body 1",
          visibility: "public",
          authorId: "user1",
          createdAt: "2025-01-01",
        },
      ];

      const deduped = dedupePostsById(posts);
      expect(deduped).toHaveLength(2);
      expect(deduped.map((p) => p.id)).toEqual(["1", "2"]);
    });

    it("preserves order of first occurrence", () => {
      const posts: FeedPost[] = [
        { id: "3", title: "Post 3", body: "", visibility: "public", authorId: "u3", createdAt: "2025-01-03" },
        { id: "1", title: "Post 1", body: "", visibility: "public", authorId: "u1", createdAt: "2025-01-01" },
        { id: "3", title: "Post 3 dup", body: "", visibility: "public", authorId: "u3", createdAt: "2025-01-03" },
        { id: "2", title: "Post 2", body: "", visibility: "public", authorId: "u2", createdAt: "2025-01-02" },
      ];

      const deduped = dedupePostsById(posts);
      expect(deduped.map((p) => p.id)).toEqual(["3", "1", "2"]);
    });

    it("handles empty array", () => {
      expect(dedupePostsById([])).toEqual([]);
    });
  });

  describe("mergePages", () => {
    it("merges multiple pages and dedupes", () => {
      const pages: FeedPage[] = [
        {
          posts: [
            { id: "1", title: "Post 1", body: "", visibility: "public", authorId: "u1", createdAt: "2025-01-01" },
            { id: "2", title: "Post 2", body: "", visibility: "public", authorId: "u2", createdAt: "2025-01-02" },
          ],
          cursor: "page1",
          hasMore: true,
        },
        {
          posts: [
            { id: "2", title: "Post 2", body: "", visibility: "public", authorId: "u2", createdAt: "2025-01-02" },
            { id: "3", title: "Post 3", body: "", visibility: "public", authorId: "u3", createdAt: "2025-01-03" },
          ],
          cursor: "page2",
          hasMore: false,
        },
      ];

      const merged = mergePages(pages);
      expect(merged).toHaveLength(3);
      expect(merged.map((p) => p.id)).toEqual(["1", "2", "3"]);
    });

    it("preserves first occurrence when merging", () => {
      const pages: FeedPage[] = [
        {
          posts: [
            { id: "1", title: "Post 1 v1", body: "", visibility: "public", authorId: "u1", createdAt: "2025-01-01" },
          ],
        },
        {
          posts: [
            { id: "1", title: "Post 1 v2", body: "", visibility: "public", authorId: "u1", createdAt: "2025-01-01" },
          ],
        },
      ];

      const merged = mergePages(pages);
      expect(merged[0].title).toBe("Post 1 v1");
    });
  });
});
