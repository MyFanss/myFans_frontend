"use client";

import React, { useCallback, useState } from "react";
import { Heart, Trash2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComments } from "@/hooks/queries/useComments";
import { useDeleteComment } from "@/hooks/mutations/useDeleteComment";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { CommentComposer } from "./CommentComposer";
import type { Comment } from "@/types/api";

interface CommentListProps {
  postId: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  onReplyClick,
}: {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onReplyClick: (parentId: string) => void;
}) {
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(
    postId
  );

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment(comment.id);
    }
  };

  if (comment.deleted) {
    return (
      <div className="py-2 text-xs text-muted-foreground italic">
        Comment removed
      </div>
    );
  }

  return (
    <article className="space-y-2 py-3 border-b last:border-b-0">
      {/* Author & date */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {comment.author.avatarUrl && (
            <img
              src={comment.author.avatarUrl}
              alt={comment.author.name}
              className="size-7 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="text-sm font-medium">{comment.author.name}</div>
            <div className="text-xs text-muted-foreground">
              @{comment.author.handle} · {formatDate(comment.createdAt)}
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {currentUserId === comment.author.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete comment"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log("report comment")}
            aria-label="Report comment"
          >
            <Flag className="size-3" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-foreground">{comment.body}</p>

      {/* Like & reply */}
      <div className="flex gap-2 text-xs">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          disabled={!currentUserId}
        >
          <Heart
            className={`mr-1 size-3 ${
              comment.likedByMe ? "fill-red-500 text-red-500" : ""
            }`}
          />
          {comment.likeCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => onReplyClick(comment.id)}
        >
          Reply
        </Button>
      </div>
    </article>
  );
}

export function CommentList({ postId }: CommentListProps) {
  const { data: user } = useCurrentUser();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useComments(postId);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const comments = data?.comments ?? [];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return <div className="text-sm text-muted-foreground">No comments yet</div>;
  }

  return (
    <div className="space-y-4">
      {/* Top-level comments */}
      <div className="group divide-y rounded-lg border">
        {comments
          .filter((c) => !c.parentId)
          .map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={user?.id}
              onReplyClick={setReplyingTo}
            />
          ))}
      </div>

      {/* Nested reply composer */}
      {replyingTo && (
        <div className="ml-4 space-y-2 rounded-lg border-l-2 border-muted pl-3 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            Replying to comment
          </div>
          <CommentComposer
            postId={postId}
            parentId={replyingTo}
            onSuccess={() => setReplyingTo(null)}
            placeholder="Write a reply..."
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReplyingTo(null)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          Load more comments
        </Button>
      )}
    </div>
  );
}
