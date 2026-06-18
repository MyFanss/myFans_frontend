import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { Subscription } from "@/types/api";

export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: () => api.get<Subscription[]>("/subscriptions"),
    enabled: typeof window !== "undefined" && !!api.getToken(),
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (creatorId: string) =>
      api.post<Subscription>("/subscriptions", { creatorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) =>
      api.delete(`/subscriptions/${subscriptionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creators.all });
    },
  });
}
