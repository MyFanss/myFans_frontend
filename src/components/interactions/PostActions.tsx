"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikePost } from "@/hooks/mutations/useLikePost";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import type { FeedPost } from "@/types/api";

interface PostActionsProps {
  post: FeedPost;
  onCommentClick?: () => void;
  onTipClick?: () => void;
}

export function PostActions({
  post,
  onCommentClick,
  onTipClick,
}: PostActionsProps) {
  const { data: user } = useCurrentUser();
  const { mutate: toggleLike, isPending: isLikePending } = useLikePost();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleLikeClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    toggleLike(post.id);
  };

  const handleCommentClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    onCommentClick?.();
  };

  const handleTipClick = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    onTipClick?.();
  };

  return (
    <>
      <div className="mt-4 flex gap-2 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          onClick={handleLikeClick}
          disabled={isLikePending}
          aria-pressed={post.isLiked}
        >
          {isLikePending ? (
            <Loader2 className="mr-1 size-4 animate-spin" aria-hidden />
          ) : (
            <Heart
              className={`mr-1 size-4 ${
                post.isLiked ? "fill-red-500 text-red-500" : ""
              }`}
              aria-hidden
            />
          )}
          {post.likeCount ?? 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          onClick={handleCommentClick}
          disabled={!user}
        >
          <MessageCircle className="mr-1 size-4" aria-hidden />
          {post.commentCount ?? 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          onClick={handleTipClick}
          disabled={!user}
        >
          <Gift className="mr-1 size-4" aria-hidden />
          Tip
        </Button>
      </div>

      {showLoginPrompt && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          <p>
            Sign in to like and comment.{" "}
            <Link
              href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`}
              className="font-medium underline hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
