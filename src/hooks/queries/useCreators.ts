import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { Creator } from "@/types/api";

interface UseCreatorsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export function useCreators(options: UseCreatorsOptions = {}) {
  const { search, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: queryKeys.creators.list({ search, page, limit }),
    queryFn: () =>
      api.get<Creator[]>("/creators", {
        params: {
          ...(search && { search }),
          page,
          limit,
        },
      }),
  });
}
