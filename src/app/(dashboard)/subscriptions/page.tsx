"use client";

import Image from "next/image";
import Link from "next/link";
import { useSubscriptions } from "@/hooks/queries/useSubscriptions";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";

export default function SubscriptionsPage() {
  const { data: subscriptions, isLoading, isError, error } = useSubscriptions();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">My Subscriptions</h1>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Failed to load subscriptions:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}

      {subscriptions && subscriptions.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-lg font-medium">No Subscriptions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t subscribed to any creators yet.
          </p>
          <div className="mt-6">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Discover Creators
            </Link>
          </div>
        </div>
      )}

      {subscriptions && subscriptions.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => {
            const creator = subscription.creator;

            // In case the backend doesn't populate creator right now, fallback
            if (!creator) return null;

            return (
              <div
                key={subscription.id}
                className="flex flex-col gap-3 rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {creator.avatarUrl ? (
                    <Image
                      src={creator.avatarUrl}
                      alt={creator.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {creator.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{creator.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      @{creator.handle}
                    </p>
                  </div>
                </div>

                {creator.bio && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {creator.bio}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Subscribed since{" "}
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </span>
                  <SubscribeButton
                    creatorId={creator.id}
                    isSubscribed={true}
                    subscriptionId={subscription.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
