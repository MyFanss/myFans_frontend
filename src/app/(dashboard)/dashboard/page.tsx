"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { UserCheck, AlertCircle } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard, { StatCardSkeleton } from "@/components/dashboard/StatCard";
import RangePicker from "@/components/dashboard/RangePicker";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/queries/useAnalytics";
import type { AnalyticsRange } from "@/types/analytics";

export default function DashboardPage() {
  const [range, setRange] = useState<AnalyticsRange>("30d");

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useAnalytics(range);

  const handleRangeChange = useCallback((newRange: AnalyticsRange) => {
    setRange(newRange);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with range picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardHeader
          creatorName={analytics?.creatorName ?? "Creator"}
          rangeLabel={analytics?.rangeLabel}
        />
        <RangePicker
          value={range}
          onChange={handleRangeChange}
          disabled={isLoading}
        />
      </div>

      {/* Loading state — skeleton cards */}
      {isLoading && (
        <section aria-label="Loading statistics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Error state — ErrorState with retry */}
      {isError && (
        <ErrorState
          title="Failed to load analytics"
          message={
            error instanceof Error
              ? error.message
              : "Could not fetch your dashboard stats. Please try again."
          }
          onRetry={() => refetch()}
        />
      )}

      {/* Empty / onboarding state */}
      {analytics && !analytics.profileComplete && (
        <EmptyState
          icon={UserCheck}
          title="Complete your profile to get started"
          description="Add your bio, profile photo, and payout details to unlock your creator dashboard stats."
          action={
            <Button asChild className="min-h-[44px]">
              <Link href="/settings/profile">Complete Profile</Link>
            </Button>
          }
        />
      )}

      {/* Live analytics data */}
      {analytics && analytics.profileComplete && (
        <section aria-labelledby="dashboard-stats-heading">
          <h2 id="dashboard-stats-heading" className="sr-only">
            Creator statistics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
