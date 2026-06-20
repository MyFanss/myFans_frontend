import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageSkeleton } from "@/components/ui/page-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"

/**
 * Demo: append ?ui=loading | ?ui=error | ?ui=empty to the URL to preview each state.
 * Remove the query param (or use ?ui=content) for the normal dashboard view.
 */

interface DashboardPageProps {
  searchParams: Promise<{ ui?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { ui } = await searchParams

  if (ui === "loading") {
    return (
      <main className="min-h-screen">
        <PageSkeleton statCards={4} contentRows={5} />
      </main>
    )
  }

  if (ui === "loading-page") {
    return (
      <main className="min-h-screen">
        <LoadingSpinner variant="page" size="lg" label="Loading dashboard…" />
      </main>
    )
  }

  if (ui === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <ErrorState
          title="Failed to load dashboard"
          message="We couldn't fetch your stats. Check your connection and try again."
          /* onRetry is a client callback — wire it up in a client wrapper when needed */
        />
      </main>
    )
  }

  if (ui === "empty") {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <EmptyState
          title="No posts yet"
          description="Start sharing content with your subscribers and grow your audience."
          action={
            <Button size="sm">Create your first post</Button>
          }
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 gap-3">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <LoadingSpinner variant="inline" size="sm" />
    </main>
  )
}
