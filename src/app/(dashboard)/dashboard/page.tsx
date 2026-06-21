import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import { mockDashboardData } from "@/lib/mocks/dashboard";

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
        <section
          aria-labelledby="dashboard-empty-heading"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/40 px-6 py-16 text-center"
        >
          <h2 id="dashboard-empty-heading" className="text-lg font-semibold">
            Complete your profile to get started
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Add your bio, profile photo, and payout details to unlock your
            creator dashboard stats.
          </p>
        </section>
      )}
    </div>
  );
}
