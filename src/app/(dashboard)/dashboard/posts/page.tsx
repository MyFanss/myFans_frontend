import { Suspense } from "react";
import { CreatorGuard } from "@/components/auth/creator-guard";
import { PostList } from "@/components/posts/PostList";
import { PostListSkeletonGroup } from "@/components/posts/PostListSkeleton";

export default function PostsPage() {
  return (
    <CreatorGuard>
      <Suspense
        fallback={
          <main className="min-h-screen p-8">
            <div className="mx-auto w-full max-w-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
              </div>
              <PostListSkeletonGroup count={4} />
            </div>
          </main>
        }
      >
        <PostList />
      </Suspense>
    </CreatorGuard>
  );
}
