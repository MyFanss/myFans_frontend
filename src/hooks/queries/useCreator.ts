import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { Creator } from "@/types/api";

export function useCreator(handle: string) {
  return useQuery({
    queryKey: queryKeys.creators.detail(handle),
    queryFn: () => api.get<Creator>(`/creators/${handle}`),
    enabled: !!handle,
  });
}
