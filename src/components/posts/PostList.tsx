"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PostListSkeletonGroup } from "@/components/posts/PostListSkeleton";
import { usePosts } from "@/hooks/queries/usePosts";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PostList() {
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = usePosts();
  const posts = data ?? [];
  const [showSuccessToast, setShowSuccessToast] = useState(
    searchParams.get("published") === "1"
  );

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!showSuccessToast) return;
    const timeout = setTimeout(() => setShowSuccessToast(false), 4000);
    return () => clearTimeout(timeout);
  }, [showSuccessToast]);

  const isLoadingInitial = isLoading && !data;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {showSuccessToast ? (
          <div className="rounded-md border border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800">
            Post published successfully.
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Posts</h1>
          <Link href="/dashboard/posts/new">
            <Button>New post</Button>
          </Link>
        </div>

        {isLoadingInitial ? <PostListSkeletonGroup count={4} /> : null}

        {isError ? (
          <ErrorState
            title="Failed to load posts"
            message={
              error instanceof Error
                ? error.message
                : "An error occurred while loading your posts."
            }
            onRetry={handleRetry}
          />
        ) : null}

        {!isLoadingInitial && !isError && posts.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No posts yet"
            description="Share updates, photos, or exclusive content with your subscribers."
            action={
              <Button asChild className="min-h-[44px]">
                <Link href="/dashboard/posts/new">
                  <Plus className="mr-2 size-4" aria-hidden />
                  Create new post
                </Link>
              </Button>
            }
          />
        ) : null}

        {!isLoadingInitial && !isError && posts.length > 0 ? (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-medium">{post.title}</h2>
                  <Badge
                    variant={
                      post.visibility === "public" ? "default" : "secondary"
                    }
                  >
                    {post.visibility === "public" ? "Public" : "Subscribers"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
