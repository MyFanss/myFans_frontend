"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostDetailPageProps {
  params: {
    id: string;
  };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">Post</h1>
        </div>
      </div>

      {/* Content stub */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Post detail page for ID: <code className="bg-muted px-2 py-1 rounded">{params.id}</code>
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            This page will display post content, author info, and engagement features.
          </p>
          <Button asChild variant="outline">
            <Link href="/home">Back to Feed</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
