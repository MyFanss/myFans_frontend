import { Notification, NotificationDeepLink } from '@/types/notifications';

// Map notification to deep link
export function getNotificationDeepLink(notification: Notification): NotificationDeepLink | null {
  const { action, actionId, metadata } = notification;

  if (!action || !actionId) {
    return null;
  }

  switch (action) {
    case 'profile':
      // Link to creator profile
      return {
        href: `/creators/${actionId}`,
        label: 'View Profile',
      };

    case 'post':
      // Link to post or feed
      return {
        href: `/feed/${actionId}`,
        label: 'View Post',
      };

    case 'message_thread':
      // Link to messages thread
      return {
        href: `/messages/${actionId}`,
        label: 'View Message',
      };

    case 'subscription':
      // Link to subscription or creator page
      return {
        href: `/subscriptions/${actionId}`,
        label: 'View Subscription',
      };

    default:
      return null;
  }
}

// Get label for notification type
export function getNotificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mention: 'Mentions',
    subscription: 'Subscriptions',
    tip: 'Tips',
    message: 'Messages',
    like: 'Likes',
    comment: 'Comments',
  };
  return labels[type] || 'Notifications';
}

// Get icon for notification type (can be enhanced with actual icons)
export function getNotificationTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    mention: '💬',
    subscription: '⭐',
    tip: '💰',
    message: '💌',
    like: '❤️',
    comment: '💭',
  };
  return icons[type] || '🔔';
}

// Format notification message (can be overridden per type)
export function formatNotificationMessage(notification: Notification): string {
  const { type, title, message, metadata } = notification;

  // Use provided message if available
  if (message) {
    return message;
  }

  // Generate based on type and metadata
  switch (type) {
    case 'mention':
      return metadata?.creatorName
        ? `${metadata.creatorName} mentioned you in a comment`
        : 'You were mentioned';

    case 'subscription':
      return metadata?.creatorName
        ? `${metadata.creatorName} just posted new content`
        : 'New content from a creator you follow';

    case 'tip':
      return metadata?.creatorName
        ? `${metadata.creatorName} sent you a tip`
        : 'You received a tip';

    case 'message':
      return metadata?.senderName
        ? `New message from ${metadata.senderName}`
        : 'You have a new message';

    case 'like':
      return metadata?.creatorName
        ? `${metadata.creatorName} liked your post`
        : 'Your post was liked';

    case 'comment':
      return metadata?.creatorName
        ? `${metadata.creatorName} commented on your post`
        : 'You received a new comment';

    default:
      return title || 'New notification';
  }
}
