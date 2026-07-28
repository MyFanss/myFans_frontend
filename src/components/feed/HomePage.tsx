"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, Plus } from "lucide-react";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { useSubscriptions } from "@/hooks/queries/useSubscriptions";
import { FeedFilters } from "./FeedFilters";
import { FeedList } from "./FeedList";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/types/api";
import type { FeedFilter } from "@/lib/api/feed";

export function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();

  const handleFilterChange = (newFilter: FeedFilter) => {
    setFilter(newFilter);
    window.dispatchEvent(
      new CustomEvent("feed_filter_change", {
        detail: { from: filter, to: newFilter },
      })
    );
  };

  const handleEngagementAction = (
    action: "like" | "comment" | "tip",
    post: FeedPost
  ) => {
    window.dispatchEvent(
      new CustomEvent("feed_post_action", {
        detail: { action, postId: post.id },
      })
    );
  };

  // Not authenticated
  if (!userLoading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <EmptyState
          icon={Plus}
          title="Sign in to view your feed"
          description="Join creators and see exclusive content from people you subscribe to."
          action={
            <Button asChild className="min-h-[44px]">
              <Link href="/login?redirect=/home">Sign in</Link>
            </Button>
          }
        />
      </main>
    );
  }

  // Zero subscriptions
  if (!subsLoading && (!subscriptions || subscriptions.length === 0)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <EmptyState
          icon={Compass}
          title="No subscriptions yet"
          description="Subscribe to creators to see their posts and exclusive content here."
          action={
            <Button asChild className="min-h-[44px]">
              <Link href="/discover">
                <Compass className="mr-2 size-4" aria-hidden />
                Discover Creators
              </Link>
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="px-4 py-6 border-b">
          <h1 className="text-2xl font-semibold">Home</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Posts from creators you subscribe to
          </p>
        </div>

        {/* Filters - sticky */}
        <FeedFilters activeFilter={filter} onFilterChange={handleFilterChange} />

        {/* Feed with infinite scroll */}
        <div className="py-4">
          <FeedList filter={filter} onActionClick={handleEngagementAction} />
        </div>
      </div>
    </main>
  );
}
