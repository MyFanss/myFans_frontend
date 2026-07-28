import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api/notifications';
import { queryKeys } from '@/lib/query-keys';
import { Notification, NotificationType } from '@/types/notifications';
import { useCallback, useEffect } from 'react';

// Get paginated notifications with filters
export function useNotifications(type?: NotificationType, unreadOnly: boolean = false) {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.listPaged(type, unreadOnly),
    queryFn: async ({ pageParam }) => {
      return getNotifications(pageParam, type, unreadOnly, 20);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadCount,
    staleTime: 1000 * 15, // 15 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // Poll every 30 seconds
  });
}

// Get flattened notifications list
export function useNotificationsList(type?: NotificationType, unreadOnly: boolean = false) {
  const query = useNotifications(type, unreadOnly);

  const notifications = query.data?.pages.flatMap(page => page.notifications) ?? [];

  // Deduplicate by ID
  const seen = new Set<string>();
  const dedupedNotifications = notifications.filter(notification => {
    if (seen.has(notification.id)) return false;
    seen.add(notification.id);
    return true;
  });

  return {
    ...query,
    notifications: dedupedNotifications,
    total: dedupedNotifications.length,
    isEmpty: dedupedNotifications.length === 0,
    isInitialLoading: query.isLoading && !query.data,
  };
}

// Mark notification as read with optimistic update
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return {
    mutate: async (notificationId: string) => {
      try {
        // Optimistic update: mark as read in all query pages
        queryClient.setQueriesData<{ pages: any[] }>(
          { queryKey: queryKeys.notifications.list() },
          (old) => {
            if (!old) return old;
            return {
              pages: old.pages.map((page) => ({
                ...page,
                notifications: page.notifications.map((notif: Notification) =>
                  notif.id === notificationId
                    ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                    : notif
                ),
                unreadCount: page.unreadCount > 0 ? page.unreadCount - 1 : 0,
              })),
            };
          }
        );

        // Update unread count
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          (old: number) => Math.max(0, old - 1)
        );

        // Call API
        const response = await markNotificationRead(notificationId);

        // Sync unread count from server
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          response.unreadCount
        );
      } catch (error) {
        // Rollback on error
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.list(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(),
        });
        throw error;
      }
    },
  };
}

// Mark all notifications as read
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return {
    mutate: async (type?: NotificationType) => {
      try {
        // Optimistic update: mark all as read
        queryClient.setQueriesData<{ pages: any[] }>(
          { queryKey: queryKeys.notifications.list() },
          (old) => {
            if (!old) return old;
            return {
              pages: old.pages.map((page) => ({
                ...page,
                notifications: page.notifications.map((notif: Notification) =>
                  !type || notif.type === type
                    ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                    : notif
                ),
                unreadCount: 0,
              })),
            };
          }
        );

        // Update unread count to 0
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          0
        );

        // Call API
        const response = await markAllNotificationsRead(type);

        // Sync unread count
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          response.unreadCount
        );
      } catch (error) {
        // Rollback on error
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.list(),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount(),
        });
        throw error;
      }
    },
  };
}

// Get latest 5 notifications (for dropdown)
export function useNotificationsDropdown() {
  const queryClient = useQueryClient();

  // Prefetch first page on hover
  const prefetch = useCallback(() => {
    queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.notifications.listPaged(),
      queryFn: async () => getNotifications(undefined, undefined, false, 5),
      initialPageParam: undefined,
    });
  }, [queryClient]);

  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications.listPaged(),
    queryFn: async () => getNotifications(undefined, undefined, false, 5),
    initialPageParam: undefined,
    getNextPageParam: () => undefined, // Don't paginate dropdown
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  const notifications = query.data?.pages[0]?.notifications ?? [];
  const unreadCount = query.data?.pages[0]?.unreadCount ?? 0;

  return {
    ...query,
    notifications,
    unreadCount,
    prefetch,
  };
}

// Subscribe to realtime transport for cache invalidation
export function useNotificationsRealtime(transport: any) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!transport || !transport.isConnected()) return;

    const unsubscribe = transport.subscribe((notification: Notification) => {
      // Invalidate notifications cache on new notification
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.list(),
      });

      // Invalidate unread count
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    });

    return () => unsubscribe();
  }, [transport, queryClient]);
}
