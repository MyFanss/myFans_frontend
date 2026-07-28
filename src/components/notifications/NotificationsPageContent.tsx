'use client';

import { NotificationType } from '@/types/notifications';
import { useNotificationsList, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationPageSkeleton } from './NotificationPageSkeleton';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { getNotificationTypeLabel } from '@/lib/notifications/deep-link';

interface NotificationsPageContentProps {
  selectedType?: NotificationType;
  onSelectType: (type?: NotificationType) => void;
  showUnreadOnly: boolean;
  onToggleUnreadOnly: (show: boolean) => void;
}

const NOTIFICATION_TYPES: NotificationType[] = ['mention', 'subscription', 'tip', 'message'];

export function NotificationsPageContent({
  selectedType,
  onSelectType,
  showUnreadOnly,
  onToggleUnreadOnly,
}: NotificationsPageContentProps) {
  const { notifications, isLoading, hasNextPage, fetchNextPage, unreadCount } =
    useNotificationsList(selectedType, showUnreadOnly);
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead(selectedType);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (isLoading && notifications.length === 0) {
    return <NotificationPageSkeleton />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="size-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <button
            onClick={() => onSelectType(undefined)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              !selectedType
                ? 'bg-blue-500 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            All
          </button>
          {NOTIFICATION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onSelectType(selectedType === type ? undefined : type)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedType === type
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {getNotificationTypeLabel(type)}
            </button>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => onToggleUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              showUnreadOnly
                ? 'bg-blue-500 text-white'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            Unread only
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <Bell className="size-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-semibold mb-2">No notifications</p>
            <p className="text-sm text-muted-foreground">
              {showUnreadOnly
                ? 'You're all caught up!'
                : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="divide-y" role="list">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="border-t p-4 text-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
