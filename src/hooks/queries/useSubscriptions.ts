import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { listSubscriptions } from "@/lib/api/subscriptions";

export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions.list(),
    queryFn: () => listSubscriptions(),
    enabled: typeof window !== "undefined" && !!api.getToken(),
  });
}
