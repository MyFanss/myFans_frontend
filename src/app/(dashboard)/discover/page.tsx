"use client";

import { useState } from "react";
import Image from "next/image";
import { useCreators } from "@/hooks/queries/useCreators";
import { Input } from "@/components/ui/input";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: creators, isLoading, isError, error } = useCreators({ search: debouncedSearch });

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    const timer = setTimeout(() => setDebouncedSearch(e.target.value), 400);
    return () => clearTimeout(timer);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Discover Creators</h1>

      <div className="mb-6">
        <Input
          placeholder="Search creators..."
          value={search}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

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
          Failed to load creators:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}

      {creators && creators.length === 0 && (
        <p className="text-sm text-muted-foreground">No creators found.</p>
      )}

      {creators && creators.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <div
              key={creator.id}
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
                    {creator.name.charAt(0).toUpperCase()}
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

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {creator.subscriberCount.toLocaleString()} subscribers
                </span>
                <SubscribeButton
                  creatorId={creator.id}
                  isSubscribed={creator.isSubscribed}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
