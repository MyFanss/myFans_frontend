import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { subscribeToCreator, unsubscribeFromCreator } from "@/lib/api/subscriptions";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/errors";
import type { Creator, Subscription } from "@/types/api";

export function useSubscribe() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: subscribeToCreator,
    onMutate: async (creatorId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.creators.all });

      const previousCreators = queryClient.getQueryData<Creator[]>(queryKeys.creators.list());

      if (previousCreators) {
        queryClient.setQueryData<Creator[]>(
          queryKeys.creators.list(),
          previousCreators.map((creator) =>
            creator.id === creatorId ? { ...creator, isSubscribed: true, subscriberCount: creator.subscriberCount + 1 } : creator
          )
        );
      }

      return { previousCreators };
    },
    onError: (err, creatorId, context) => {
      if (context?.previousCreators) {
        queryClient.setQueryData(queryKeys.creators.list(), context.previousCreators);
      }
      if (err instanceof ApiError && err.statusCode === 401) {
        toast.error("Please log in to subscribe");
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else {
        toast.error("Failed to subscribe");
      }
    },
    onSuccess: () => {
      toast.success("Subscribed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: unsubscribeFromCreator,
    onMutate: async (subscriptionId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.creators.all });

      const previousSubscriptions = queryClient.getQueryData<Subscription[]>(queryKeys.subscriptions.list());
      const previousCreators = queryClient.getQueryData<Creator[]>(queryKeys.creators.list());

      let creatorId: string | undefined;

      if (previousSubscriptions) {
        const sub = previousSubscriptions.find(s => s.id === subscriptionId);
        if (sub) creatorId = sub.creatorId;

        queryClient.setQueryData<Subscription[]>(
          queryKeys.subscriptions.list(),
          previousSubscriptions.filter((sub) => sub.id !== subscriptionId)
        );
      }

      if (previousCreators && creatorId) {
        queryClient.setQueryData<Creator[]>(
          queryKeys.creators.list(),
          previousCreators.map((creator) =>
            creator.id === creatorId ? { ...creator, isSubscribed: false, subscriberCount: Math.max(0, creator.subscriberCount - 1) } : creator
          )
        );
      }

      return { previousSubscriptions, previousCreators };
    },
    onError: (err, subscriptionId, context) => {
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(queryKeys.subscriptions.list(), context.previousSubscriptions);
      }
      if (context?.previousCreators) {
        queryClient.setQueryData(queryKeys.creators.list(), context.previousCreators);
      }

      if (err instanceof ApiError && err.statusCode === 401) {
        toast.error("Please log in to unsubscribe");
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else {
        toast.error("Failed to unsubscribe");
      }
    },
    onSuccess: () => {
      toast.success("Unsubscribed successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}
