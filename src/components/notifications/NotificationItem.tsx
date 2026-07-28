'use client';

import { Notification } from '@/types/notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMarkNotificationRead } from '@/hooks/useNotifications';
import { getNotificationDeepLink, formatNotificationMessage } from '@/lib/notifications/deep-link';
import { formatRelativeTime } from '@/lib/utils/time';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onNavigate?: () => void;
}

export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const { mutate: markAsRead } = useMarkNotificationRead();
  const deepLink = getNotificationDeepLink(notification);

  const handleClick = async () => {
    // Mark as read before navigating
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        // Don't block navigation on error
      }
    }
    onNavigate?.();
  };

  const content = (
    <div
      className={cn(
        'px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20'
      )}
      onClick={handleClick}
    >
      <Avatar className="size-10 flex-shrink-0">
        <AvatarImage src={notification.avatar} alt={notification.title} />
        <AvatarFallback>{notification.title.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-1">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {formatNotificationMessage(notification)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(new Date(notification.createdAt))}
        </p>
      </div>

      {!notification.isRead && (
        <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );

  if (deepLink) {
    return <Link href={deepLink.href}>{content}</Link>;
  }

  return content;
}
