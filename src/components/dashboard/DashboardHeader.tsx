interface DashboardHeaderProps {
  creatorName: string;
}

export default function DashboardHeader({ creatorName }: DashboardHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome back, {creatorName}
      </h1>
      <p className="text-sm text-muted-foreground">
        Here&apos;s an overview of your creator activity.
      </p>
    </header>
  );
}
