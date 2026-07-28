"use client";

import Link from "next/link";
import { Heart, MessageCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/types/api";

interface FeedPostCardProps {
  post: FeedPost;
  onActionClick?: (action: "like" | "comment" | "tip", post: FeedPost) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FeedPostCard({ post, onActionClick }: FeedPostCardProps) {
  if (post.isMuted || post.isBlocked) {
    return null;
  }

  const hasMedia = !!post.mediaUrl;

  return (
    <article
      className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
      role="article"
    >
      {/* Media section with aspect ratio constraint */}
      {hasMedia && (
        <div className="relative w-full bg-muted overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img
            src={post.mediaUrl}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content section */}
      <div className="p-4">
        {/* Author info */}
        {post.author && (
          <div className="flex items-center gap-3 mb-3">
            {post.author.avatarUrl && (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="size-10 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="font-medium text-sm">{post.author.name}</div>
              <div className="text-xs text-muted-foreground">@{post.author.handle}</div>
            </div>
          </div>
        )}

        {/* Post content */}
        <Link href={`/posts/${post.id}`} className="block group">
          <h3 className="font-semibold text-base group-hover:underline line-clamp-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.body}</p>

        {/* Meta */}
        <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          {post.visibility === "subscribers" && (
            <span className="inline-block px-2 py-1 bg-muted rounded text-xs font-medium">
              Subscribers
            </span>
          )}
        </div>

        {/* Action slots for engagement (likes, comments, tips) */}
        <div className="mt-4 flex gap-2 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onActionClick?.("like", post)}
            aria-pressed={post.isLiked}
          >
            <Heart
              className={`mr-1 size-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
              aria-hidden
            />
            {post.likeCount ?? 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onActionClick?.("comment", post)}
          >
            <MessageCircle className="mr-1 size-4" aria-hidden />
            {post.commentCount ?? 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onActionClick?.("tip", post)}
          >
            <Gift className="mr-1 size-4" aria-hidden />
            Tip
          </Button>
        </div>
      </div>
    </article>
  );
}
