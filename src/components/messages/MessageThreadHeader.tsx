'use client';

import { Thread } from '@/types/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface MessageThreadHeaderProps {
  thread: Thread;
  onBack?: () => void;
}

export function MessageThreadHeader({ thread, onBack }: MessageThreadHeaderProps) {
  return (
    <div className="border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="lg:hidden"
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}

        <Avatar className="size-10">
          <AvatarImage
            src={thread.participant.avatar}
            alt={thread.participant.displayName}
          />
          <AvatarFallback>
            {thread.participant.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="font-semibold truncate">
            {thread.participantDeleted
              ? 'Deleted user'
              : thread.isBlocked
                ? 'Blocked user'
                : thread.participant.displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {thread.participant.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Future: Add options menu */}
      <div className="text-muted-foreground text-xs">
        {thread.isMuted ? 'Muted' : ''}
      </div>
    </div>
  );
}
