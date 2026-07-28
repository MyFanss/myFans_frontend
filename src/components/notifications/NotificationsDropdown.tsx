'use client';

import Link from 'next/link';
import { useNotificationsDropdown, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationDropdownSkeleton } from './NotificationDropdownSkeleton';
import { Button } from '@/components/ui/button';
import { CheckCheck, ChevronRight } from 'lucide-react';

interface NotificationsDropdownProps {
  onClose: () => void;
}

export function NotificationsDropdown({ onClose }: NotificationsDropdownProps) {
  const { notifications, unreadCount, isLoading } = useNotificationsDropdown();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs"
          >
            <CheckCheck className="size-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <NotificationDropdownSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onNavigate={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t px-4 py-3">
          <Link href="/notifications" onClick={onClose}>
            <Button variant="ghost" className="w-full justify-between">
              View all notifications
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
