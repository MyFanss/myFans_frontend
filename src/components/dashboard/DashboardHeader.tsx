interface DashboardHeaderProps {
  creatorName: string;
  /** Range label shown in subtitle, e.g. "Last 30 days" */
  rangeLabel?: string;
}

export default function DashboardHeader({
  creatorName,
  rangeLabel,
}: DashboardHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome back, {creatorName}
      </h1>
      <p className="text-sm text-muted-foreground">
        Here&apos;s an overview of your creator activity
        {rangeLabel && <span> &mdash; {rangeLabel}</span>}.
      </p>
    </header>
  );
}
