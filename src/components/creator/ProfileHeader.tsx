import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { CreatorProfile } from "@/types/api";

interface ProfileHeaderProps {
  creator: CreatorProfile;
  action: React.ReactNode;
}

function getInitials(displayName: string): string {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ProfileHeader({ creator, action }: ProfileHeaderProps) {
  const initials = getInitials(creator.displayName);

  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="relative aspect-[3/1] min-h-36 overflow-hidden bg-muted sm:aspect-[4/1]">
        {creator.bannerUrl ? (
          <Image
            src={creator.bannerUrl}
            alt={`${creator.displayName} banner`}
            fill
            sizes="(max-width: 640px) 100vw, 1024px"
            className="absolute inset-0 h-full w-full object-cover"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#111827,#374151_48%,#e5e7eb)]" />
        )}
      </div>

      <div className="px-4 pb-6 sm:px-6">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted text-2xl font-semibold text-muted-foreground sm:h-28 sm:w-28">
              {creator.avatarUrl ? (
                <Image
                  src={creator.avatarUrl}
                  alt={`${creator.displayName} avatar`}
                  fill
                  sizes="112px"
                  className="absolute inset-0 h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span aria-hidden="true">{initials}</span>
              )}
            </div>

            <div className="min-w-0 space-y-2 pt-1 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  {creator.displayName}
                </h1>
                <Badge variant="secondary">{creator.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">@{creator.handle}</p>
              <p className="text-sm font-medium">
                {creator.subscriberCount.toLocaleString()} subscribers
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">{action}</div>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          {creator.bio}
        </p>
      </div>
    </section>
  );
}
