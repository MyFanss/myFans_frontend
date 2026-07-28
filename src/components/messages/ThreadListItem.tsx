'use client';

import { Thread } from '@/types/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatMessageTime } from '@/lib/messages/optimistic';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreadListItemProps {
  thread: Thread;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThreadListItem({
  thread,
  isSelected,
  onSelect,
}: ThreadListItemProps) {
  const preview = thread.lastMessage?.content || 'No messages yet';
  const isDeleted = thread.participantDeleted;
  const isBlocked = thread.isBlocked;

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={onSelect}
      className={cn(
        'w-full p-3 text-left hover:bg-muted/50 transition-colors border-l-2',
        isSelected ? 'bg-muted border-l-primary' : 'border-l-transparent'
      )}
    >
      <div className="flex gap-3">
        <Avatar className="size-10 flex-shrink-0">
          <AvatarImage
            src={thread.participant.avatar}
            alt={thread.participant.displayName}
          />
          <AvatarFallback>
            {thread.participant.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium truncate">
              {isDeleted ? (
                <span className="text-muted-foreground italic">
                  Deleted user
                </span>
              ) : isBlocked ? (
                <span className="text-muted-foreground italic">
                  Blocked user
                </span>
              ) : (
                thread.participant.displayName
              )}
            </p>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {thread.lastMessageAt
                ? formatMessageTime(thread.lastMessageAt)
                : 'Today'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground truncate">
              {preview.length > 50
                ? `${preview.substring(0, 50)}...`
                : preview}
            </p>
            {thread.isMuted && (
              <Bell className="size-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>

        {thread.unreadCount > 0 && (
          <div className="size-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 font-medium">
            {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}
