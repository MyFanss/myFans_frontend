"use client";

import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { SubscribeButton } from "@/components/subscriptions/SubscribeButton";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p>Loading profile...</p>
      </main>
    );
  }

  // NOTE: For demonstration purposes of the Subscribe to Creator Flow on a profile page.
  // In a real app, this page might be the logged-in user's own profile, and viewing other
  // creators would happen on a dynamic route like /creators/[id].
  const mockCreatorProfileId = "mock-creator-id-123";
  const mockIsSubscribed = false;

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{user?.email || "Creator Name"}</h1>
          <p className="text-muted-foreground mt-1">@creator_handle</p>
          <p className="mt-4 max-w-lg">
            Welcome to my creator profile! Here is where I post exclusive content for my subscribers.
          </p>
        </div>
        
        {/* Only show subscribe button if we are viewing someone else's profile */}
        <div className="mt-2">
          <SubscribeButton 
            creatorId={mockCreatorProfileId} 
            isSubscribed={mockIsSubscribed} 
          />
        </div>
      </div>
    </main>
  );
}
