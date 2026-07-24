/**
 * Analytics API — fetches creator dashboard metrics.
 *
 * GET /creators/me/analytics?range=7d|30d|90d
 */

import { api } from "./client";
import type { AnalyticsRange, AnalyticsResponse } from "@/types/analytics";

/**
 * Fetch creator analytics for a given date range.
 *
 * When the profile is incomplete (`profileComplete === false`),
 * the API returns empty stats with the creator name so the
 * dashboard can still show the onboarding CTA.
 */
export async function fetchAnalytics(
  range: AnalyticsRange = "30d",
): Promise<AnalyticsResponse> {
  return api.get<AnalyticsResponse>("/creators/me/analytics", {
    params: { range },
  });
}
