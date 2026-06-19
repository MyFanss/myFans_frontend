import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/creator/ProfileHeader";
import { SubscribeButton } from "@/components/creator/SubscribeButton";
import { getCreatorByHandle } from "@/lib/api/creators";
import { isAuthenticated } from "@/lib/auth/session.server";
import type { CreatorPostPreview } from "@/types/api";

interface CreatorPageProps {
  params: Promise<{
    handle: string;
  }>;
}

function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(date));
}

function PostsSection({ posts }: { posts: CreatorPostPreview[] }) {
  return (
    <section className="mt-8 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Posts</h2>
          <p className="text-sm text-muted-foreground">
            Public previews from this creator.
          </p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">
                {formatPostDate(post.publishedAt)}
              </p>
              <h3 className="mt-2 font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center">
          <h3 className="font-semibold">Posts coming soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            This creator has not published public previews yet.
          </p>
        </div>
      )}
    </section>
  );
}

export async function generateMetadata({
  params,
}: CreatorPageProps): Promise<Metadata> {
  const { handle } = await params;
  const creator = await getCreatorByHandle(handle);

  if (!creator) {
    return {
      title: "Creator not found | MyFans",
    };
  }

  return {
    title: `${creator.displayName} (@${creator.handle}) | MyFans`,
    description: creator.bio,
  };
}

export default async function CreatorPublicProfilePage({
  params,
}: CreatorPageProps) {
  const { handle } = await params;
  const [creator, authenticated] = await Promise.all([
    getCreatorByHandle(handle),
    isAuthenticated(),
  ]);

  if (!creator) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold">
            MyFans
          </Link>
          {!authenticated ? (
            <Link
              href={`/login?redirect=${encodeURIComponent(`/creators/${creator.handle}`)}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <ProfileHeader
          creator={creator}
          action={
            <SubscribeButton
              creatorId={creator.id}
              creatorUserId={creator.userId}
              creatorHandle={creator.handle}
              isAuthenticated={authenticated}
              isSubscribed={creator.isSubscribed}
            />
          }
        />
        <PostsSection posts={creator.recentPosts ?? []} />
      </div>
    </main>
  );
}
