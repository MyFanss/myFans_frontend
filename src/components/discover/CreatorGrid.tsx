import { SearchX } from "lucide-react";
import CreatorCard from "./CreatorCard";
import type { Creator } from "@/types/api";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface CreatorGridProps {
  creators: Creator[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function CreatorGrid({ creators, isLoading, onResetFilters }: CreatorGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading creators"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No creators found"
        description="We couldn't find any creators matching your search or active filters."
        action={
          onResetFilters ? (
            <Button onClick={onResetFilters} variant="outline" className="min-h-[44px]">
              Clear filters
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  );
}
