"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { useCreateComment } from "@/hooks/mutations/useCreateComment";
import type { Comment } from "@/types/api";

interface CommentComposerProps {
  postId: string;
  parentId?: string;
  onSuccess?: (comment: Comment) => void;
  placeholder?: string;
}

export function CommentComposer({
  postId,
  parentId,
  onSuccess,
  placeholder = "Add a comment...",
}: CommentComposerProps) {
  const { data: user } = useCurrentUser();
  const [body, setBody] = useState("");
  const { mutate: createComment, isPending } = useCreateComment({
    postId,
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !user) return;
    createComment({ body: body.trim(), parentId });
    setBody("");
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={500}
        placeholder={placeholder}
        disabled={isPending}
        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground disabled:opacity-50"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!body.trim() || isPending}
        aria-label="Post comment"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </form>
  );
}
