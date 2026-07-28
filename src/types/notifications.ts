// Notifications Types

export type NotificationType = 'mention' | 'subscription' | 'tip' | 'message' | 'like' | 'comment';

export type NotificationAction = 'profile' | 'post' | 'message_thread' | 'subscription';

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  action?: NotificationAction;
  actionId?: string; // Post ID, user ID, thread ID, etc
  title: string;
  message: string;
  avatar?: string; // Sender's avatar
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>; // Additional context
}

// API Responses
export interface NotificationsListResponse {
  notifications: Notification[];
  unreadCount: number;
  nextCursor?: string;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface MarkNotificationReadResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkAllNotificationsReadRequest {
  type?: NotificationType; // Optional: mark all of a specific type
}

export interface MarkAllNotificationsReadResponse {
  success: boolean;
  markedCount: number;
  unreadCount: number;
}

// Realtime Transport
export interface NotificationsTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(callback: (notification: Notification) => void): () => void; // Returns unsubscribe function
  isConnected(): boolean;
}

export interface NotificationEvent {
  type: 'new' | 'read' | 'delete';
  notification: Notification;
}

// UI State
export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

export interface NotificationsFilter {
  type?: NotificationType;
  unreadOnly?: boolean;
}

// Dropdown State
export interface NotificationsDropdownState {
  isOpen: boolean;
  latest: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

// Deep Link Target
export interface NotificationDeepLink {
  href: string;
  label: string;
}

// Reconciliation
export interface UnreadReconciliation {
  localCount: number;
  serverCount: number;
  lastSyncAt: number;
}
