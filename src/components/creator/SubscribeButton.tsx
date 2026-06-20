"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { useSubscribe } from "@/hooks/queries/useSubscriptions";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/api";

interface SubscribeButtonProps {
  creatorId: string;
  creatorUserId?: string;
  creatorHandle: string;
  isAuthenticated: boolean;
  isSubscribed?: boolean;
}

export function SubscribeButton({
  creatorId,
  creatorUserId,
  creatorHandle,
  isAuthenticated,
  isSubscribed = false,
}: SubscribeButtonProps) {
  const currentUserQuery = useCurrentUser();
  const subscribe = useSubscribe();
  const [storedUser, setStoredUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState(isSubscribed);

  useEffect(() => {
    setStoredUser(api.getCurrentUser());
  }, []);

  const currentUser = currentUserQuery.data ?? storedUser;
  const isOwnProfile =
    currentUser?.role === "creator" &&
    Boolean(currentUser.id === creatorUserId || currentUser.id === creatorId);

  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <Link href={`/login?redirect=${encodeURIComponent(`/creators/${creatorHandle}`)}`}>
          Log in to subscribe
        </Link>
      </Button>
    );
  }

  if (isOwnProfile) {
    return (
      <Button disabled className="w-full sm:w-auto">
        Your profile
      </Button>
    );
  }

  return (
    <Button
      className="w-full sm:w-auto"
      disabled={subscribe.isPending || subscribed || currentUserQuery.isLoading}
      onClick={() =>
        subscribe.mutate(creatorId, {
          onSuccess: () => setSubscribed(true),
        })
      }
    >
      {subscribe.isPending
        ? "Subscribing..."
        : subscribed
          ? "Subscribed"
          : currentUserQuery.isLoading
            ? "Checking..."
            : "Subscribe"}
    </Button>
  );
}
