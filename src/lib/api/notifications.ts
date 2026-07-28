import {
  Notification,
  NotificationsListResponse,
  UnreadCountResponse,
  MarkNotificationReadResponse,
  MarkAllNotificationsReadResponse,
  NotificationType,
} from '@/types/notifications';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get notifications list with pagination and filters
export async function getNotifications(
  cursor?: string,
  type?: NotificationType,
  unreadOnly: boolean = false,
  limit: number = 20
): Promise<NotificationsListResponse> {
  try {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (type) params.append('type', type);
    if (unreadOnly) params.append('unreadOnly', 'true');
    params.append('limit', limit.toString());

    const response = await fetch(
      `${API_URL}/api/notifications?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return (await response.json()) as NotificationsListResponse;
  } catch (err) {
    console.error('Error fetching notifications:', err);
    throw err;
  }
}

// Get unread count (lightweight endpoint)
export async function getUnreadCount(): Promise<number> {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications/unread-count`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return 0; // Default to 0 on error
    }

    const data = (await response.json()) as UnreadCountResponse;
    return data.unreadCount;
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return 0;
  }
}

// Mark single notification as read
export async function markNotificationRead(
  notificationId: string
): Promise<MarkNotificationReadResponse> {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notification read: ${response.statusText}`);
    }

    return (await response.json()) as MarkNotificationReadResponse;
  } catch (err) {
    console.error('Error marking notification read:', err);
    throw err;
  }
}

// Mark all notifications as read (with optional type filter)
export async function markAllNotificationsRead(
  type?: NotificationType
): Promise<MarkAllNotificationsReadResponse> {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const response = await fetch(
      `${API_URL}/api/notifications/read-all?${params.toString()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications read: ${response.statusText}`);
    }

    return (await response.json()) as MarkAllNotificationsReadResponse;
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    throw err;
  }
}

// Delete notification (optional, stub OK)
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error deleting notification:', err);
    throw err;
  }
}

// Dismiss all notifications of a type (optional)
export async function dismissNotificationsByType(
  type: NotificationType
): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications/dismiss?type=${type}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to dismiss notifications: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error dismissing notifications:', err);
    throw err;
  }
}
