"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listPosts } from "@/lib/api/posts";
import type { Post } from "@/types/api";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PostList() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(
    searchParams.get("published") === "1"
  );

  useEffect(() => {
    let isMounted = true;

    listPosts()
      .then((data) => {
        if (isMounted) setPosts(data);
      })
      .catch(() => {
        if (isMounted) setError("Failed to load posts.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showSuccessToast) return;
    const timeout = setTimeout(() => setShowSuccessToast(false), 4000);
    return () => clearTimeout(timeout);
  }, [showSuccessToast]);

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

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!isLoading && !error && posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : null}

        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-medium">{post.title}</h2>
                <Badge
                  variant={post.visibility === "public" ? "default" : "secondary"}
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
      </div>
    </main>
  );
}
