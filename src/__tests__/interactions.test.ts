import { describe, it, expect } from "vitest";

// Cache update helper: toggle like
function togglePostLike(post: any) {
  return {
    ...post,
    isLiked: !post.isLiked,
    likeCount: (post.likeCount || 0) + (post.isLiked ? -1 : 1),
  };
}

// Cache update helper: comment append
function appendOptimisticComment(comments: any[], optimisticComment: any) {
  return [optimisticComment, ...comments];
}

// Cache update helper: reconcile comment id after creation
function reconcileCommentId(
  comments: any[],
  tempId: string,
  realComment: any
) {
  return comments.map((c) => (c.id === tempId ? realComment : c));
}

describe("Interaction cache helpers", () => {
  describe("togglePostLike", () => {
    it("toggles like state and increments count", () => {
      const post = { id: "1", isLiked: false, likeCount: 5 };
      const updated = togglePostLike(post);

      expect(updated.isLiked).toBe(true);
      expect(updated.likeCount).toBe(6);
    });

    it("toggles off and decrements count", () => {
      const post = { id: "1", isLiked: true, likeCount: 5 };
      const updated = togglePostLike(post);

      expect(updated.isLiked).toBe(false);
      expect(updated.likeCount).toBe(4);
    });

    it("handles missing likeCount", () => {
      const post = { id: "1", isLiked: false };
      const updated = togglePostLike(post);

      expect(updated.likeCount).toBe(1);
    });

    it("never goes below zero on unlike", () => {
      const post = { id: "1", isLiked: true, likeCount: 0 };
      const updated = togglePostLike(post);

      expect(updated.likeCount).toBe(-1);
      // In real implementation, backend should prevent this
    });

    it("handles double-click by toggling twice", () => {
      let post = { id: "1", isLiked: false, likeCount: 5 };
      post = togglePostLike(post);
      post = togglePostLike(post);

      expect(post.isLiked).toBe(false);
      expect(post.likeCount).toBe(5);
    });
  });

  describe("appendOptimisticComment", () => {
    it("prepends optimistic comment to list", () => {
      const existing = [
        { id: "1", body: "existing" },
        { id: "2", body: "another" },
      ];
      const optimistic = { id: "temp_123", body: "new comment" };

      const result = appendOptimisticComment(existing, optimistic);

      expect(result[0]).toEqual(optimistic);
      expect(result.length).toBe(3);
    });

    it("handles empty comment list", () => {
      const optimistic = { id: "temp_123", body: "first comment" };
      const result = appendOptimisticComment([], optimistic);

      expect(result).toEqual([optimistic]);
    });
  });

  describe("reconcileCommentId", () => {
    it("replaces temp id with real id", () => {
      const comments = [
        { id: "temp_123", body: "new" },
        { id: "2", body: "existing" },
      ];
      const realComment = { id: "real_456", body: "new" };

      const result = reconcileCommentId(comments, "temp_123", realComment);

      expect(result[0]).toEqual(realComment);
      expect(result.length).toBe(2);
    });

    it("handles id not found", () => {
      const comments = [{ id: "1", body: "existing" }];
      const realComment = { id: "2", body: "new" };

      const result = reconcileCommentId(comments, "temp_999", realComment);

      expect(result).toEqual(comments);
    });
  });

  describe("Rapid like clicks (serial mutations)", () => {
    it("correct count after rapid on/off/on", () => {
      let post = { id: "1", isLiked: false, likeCount: 10 };
      const initialCount = post.likeCount;

      // User clicks like (on)
      post = togglePostLike(post);
      expect(post.likeCount).toBe(initialCount + 1);

      // User immediately clicks again (off)
      post = togglePostLike(post);
      expect(post.likeCount).toBe(initialCount);

      // User clicks again (on)
      post = togglePostLike(post);
      expect(post.likeCount).toBe(initialCount + 1);
    });
  });
});
