/**
 * Analytics types for creator dashboard metrics backed by the API.
 */

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface AnalyticsTrend {
  direction: "up" | "down" | "neutral";
  label: string;
  percentage: number;
}

export interface AnalyticsStat {
  label: string;
  value: string;
  rawValue: number;
  trend?: AnalyticsTrend;
}

export interface CreatorAnalytics {
  /** The range these stats cover */
  range: AnalyticsRange;
  /** Display-friendly range label e.g. "Last 7 days" */
  rangeLabel: string;
  /** Profile completeness flag for onboarding CTA */
  profileComplete: boolean;
  /** Creator display name */
  creatorName: string;
  /** Aggregated stat cards */
  stats: AnalyticsStat[];
  /** Earnings breakdown (can be extended later) */
  earnings?: {
    total: number;
    currency: string;
    change: number;
  };
  /** Subscriber count with trend */
  subscribers?: {
    total: number;
    new: number;
    trend: AnalyticsTrend;
  };
  /** Post count with trend */
  posts?: {
    total: number;
    published: number;
    trend: AnalyticsTrend;
  };
}

/** Shape returned by GET /creators/me/analytics?range=7d|30d|90d */
export type AnalyticsResponse = CreatorAnalytics;
