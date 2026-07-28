'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export function MessagesEmptyState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <MessageCircle className="size-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No conversations yet</h2>
        <p className="text-muted-foreground mb-6">
          Start a new conversation with creators you're following or discover new ones.
        </p>
        <Link href="/discover">
          <Button>
            <Plus className="size-4 mr-2" />
            Discover Creators
          </Button>
        </Link>
      </div>
    </div>
  );
}
