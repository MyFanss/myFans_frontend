"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFeed } from "@/hooks/queries/useFeed";
import { FeedPostCard } from "./FeedPostCard";
import { FeedPostSkeletonGroup } from "./FeedPostSkeleton";
import { ErrorState } from "@/components/ui/error-state";
import type { FeedPost } from "@/types/api";
import type { FeedFilter } from "@/lib/api/feed";

interface FeedListProps {
  filter?: FeedFilter;
  onActionClick?: (action: "like" | "comment" | "tip", post: FeedPost) => void;
}

export function FeedList({ filter = "all", onActionClick }: FeedListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useFeed(filter);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "500px", threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const posts = data?.posts ?? [];
  const isLoadingInitial = isLoading && !data;

  // Prefetch analytics
  useEffect(() => {
    if (posts.length > 0) {
      const event = new CustomEvent("feed_view", {
        detail: { postCount: posts.length, filter },
      });
      window.dispatchEvent(event);
    }
  }, [posts.length, filter]);

  if (isLoadingInitial) {
    return (
      <div className="space-y-4 px-4">
        <FeedPostSkeletonGroup count={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-8">
        <ErrorState
          title="Failed to load feed"
          message={error instanceof Error ? error.message : "An error occurred while loading the feed."}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (posts.length === 0 && !isFetching) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No posts to show.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 px-4">
        {posts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            onActionClick={onActionClick}
          />
        ))}

        {/* Loading skeleton while fetching next page */}
        {isFetchingNextPage && (
          <div className="space-y-4 opacity-50">
            <FeedPostSkeletonGroup count={2} />
          </div>
        )}

        {/* Sentinel for infinite scroll trigger */}
        <div ref={sentinelRef} className="py-4 text-center" role="status" aria-live="polite">
          {isFetchingNextPage ? (
            <p className="text-xs text-muted-foreground">Loading more posts...</p>
          ) : hasNextPage ? (
            <p className="text-xs text-muted-foreground">Scroll for more</p>
          ) : posts.length > 0 ? (
            <p className="text-xs text-muted-foreground">No more posts</p>
          ) : null}
        </div>

        {/* Soft-fail next page error */}
        {isFetching && isError && posts.length > 0 && (
          <div className="mx-4 p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700 flex items-center justify-between">
            <span>Couldn't load more posts</span>
            <button
              onClick={() => void fetchNextPage()}
              className="underline font-medium hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </>
  );
}
