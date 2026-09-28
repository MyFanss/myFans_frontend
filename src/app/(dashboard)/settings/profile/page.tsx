"use client";

import { useQuery } from "@tanstack/react-query";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type Profile = {
  name: string;
  email: string;
};

async function fetchProfile(): Promise<Profile> {
  const res = await fetch("/api/settings/profile");
  if (!res.ok) {
    throw new Error("Failed to load profile");
  }
  return res.json();
}

export default function ProfileSettingsPage() {
  const isOnline = useOnlineStatus();
  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: fetchProfile,
  });

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your profile"
        description={
          isOnline
            ? "Something went wrong while fetching your profile."
            : "You're offline. Reconnect and try again."
        }
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return <ProfileForm profile={data} />;
}
