import Link from "next/link";
import { UserCheck } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { mockDashboardData } from "@/lib/mocks/dashboard";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { creatorName, profileComplete, stats } = mockDashboardData;

  return (
    <div className="space-y-8">
      <DashboardHeader creatorName={creatorName} />

      {profileComplete ? (
        <section aria-labelledby="dashboard-stats-heading">
          <h2 id="dashboard-stats-heading" className="sr-only">
            Creator statistics
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </section>
      ) : (
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
    </div>
  );
}
