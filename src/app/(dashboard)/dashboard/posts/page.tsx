import { Suspense } from "react";
import { CreatorGuard } from "@/components/auth/creator-guard";
import { PostList } from "@/components/posts/PostList";

export default function PostsPage() {
  return (
    <CreatorGuard>
      <Suspense
        fallback={
          <main className="min-h-screen p-8">
            <p>Loading...</p>
          </main>
        }
      >
        <PostList />
      </Suspense>
    </CreatorGuard>
  );
}
