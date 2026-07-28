"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentList } from "./CommentList";
import { CommentComposer } from "./CommentComposer";
import type { FeedPost } from "@/types/api";

interface CommentPanelProps {
  post: FeedPost;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function CommentPanel({
  post,
  isOpen,
  onClose,
  isMobile = false,
}: CommentPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isMobile, onClose]);

  if (isMobile) {
    // Mobile drawer
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-t-lg bg-background p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          ref={panelRef}
          role="dialog"
          aria-labelledby="comment-panel-title"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b pb-3">
            <h2 id="comment-panel-title" className="font-semibold">
              Comments
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-120px)]">
            <CommentList postId={post.id} />
            <CommentComposer postId={post.id} />
          </div>
        </div>
      </div>
    );
  }

  // Desktop side panel
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/30"
      onClick={onClose}
      role="presentation"
    />
  );
}
