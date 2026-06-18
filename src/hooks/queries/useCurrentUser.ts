import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: () => api.get<User>("/users/me"),
    enabled: typeof window !== "undefined" && !!api.getToken(),
  });
}
