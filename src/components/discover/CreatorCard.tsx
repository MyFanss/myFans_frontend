import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Creator } from "@/types/api";

interface CreatorCardProps {
  creator: Creator;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link
      href={`/creators/${creator.handle}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition hover:border-primary/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View ${creator.name}'s profile`}
    >
      <div className="flex items-center gap-3">
        {creator.avatarUrl ? (
          <Image
            src={creator.avatarUrl}
            alt={creator.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold"
            aria-hidden="true"
          >
            {creator.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight group-hover:text-primary">
            {creator.name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            @{creator.handle}
          </p>
        </div>

        <Badge variant="secondary" className="shrink-0 text-xs">
          {creator.category}
        </Badge>
      </div>

      {creator.bio && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {creator.bio}
        </p>
      )}

      <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{creator.subscriberCount.toLocaleString()} subscribers</span>
      </div>
    </Link>
  );
}
