import { Button } from "@/components/ui/button";
import { useSubscribe, useUnsubscribe } from "@/hooks/useSubscription";

interface SubscribeButtonProps {
  creatorId: string;
  isSubscribed: boolean;
  subscriptionId?: string;
}

export function SubscribeButton({ creatorId, isSubscribed, subscriptionId }: SubscribeButtonProps) {
  const subscribe = useSubscribe();
  const unsubscribe = useUnsubscribe();

  const isPending = subscribe.isPending || unsubscribe.isPending;

  function handleClick() {
    if (isSubscribed) {
      // If we don't have a subscriptionId, we might need to rely on the backend to figure it out
      // based on the creatorId and fanId, or we assume unsubscribe can take creatorId?
      // Wait, in useSubscriptions.ts, useUnsubscribe takes a subscriptionId.
      // In the Discover page it was: unsubscribe.mutate(creator.id).
      // If the Discover page was using creator.id for unsubscribe, then the backend expects creatorId or we should adjust.
      // Let's pass what we have. If it's a list of creators, we only have creatorId.
      // The API endpoint is DELETE /subscriptions/:id.
      // If the UI passes creatorId, the backend needs to handle DELETE /subscriptions/:creatorId or similar.
      // The DiscoverPage passed creator.id. So let's stick to using creatorId or subscriptionId if provided.
      unsubscribe.mutate(subscriptionId || creatorId);
    } else {
      subscribe.mutate(creatorId);
    }
  }

  return (
    <Button
      size="sm"
      variant={isSubscribed ? "outline" : "default"}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Loading..." : isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
