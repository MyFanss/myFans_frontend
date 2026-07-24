import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { fetchAnalytics } from "@/lib/api/analytics";
import type { AnalyticsRange, AnalyticsResponse } from "@/types/analytics";

/**
 * Hook to fetch creator analytics for a given date range.
 *
 * Automatically enabled only when the user has a valid access token.
 * Range changes trigger a new fetch via the query key without a full reload.
 *
 * States:
 * - `isLoading` → show skeleton
 * - `isError`   → show ErrorState with retry
 * - `data`      → render stat cards (or onboarding CTA if !profileComplete)
 */
export function useAnalytics(range: AnalyticsRange = "30d") {
  return useQuery<AnalyticsResponse>({
    queryKey: queryKeys.creators.analytics(range),
    queryFn: () => fetchAnalytics(range),
    enabled: typeof window !== "undefined" && !!api.getToken(),
  });
}
