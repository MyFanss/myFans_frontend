import { Notification, NotificationsTransport, NotificationEvent } from '@/types/notifications';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Polling Transport — Default implementation
export class PollingTransport implements NotificationsTransport {
  private pollInterval: number = 3000; // 3 seconds
  private pollTimer?: NodeJS.Timeout;
  private lastPollAt: number = 0;
  private isConnectedFlag: boolean = false;
  private subscribers: Set<(notification: Notification) => void> = new Set();
  private seenIds: Set<string> = new Set(); // Dedup
  private isPageVisible: boolean = true;
  private backoffMultiplier: number = 1;
  private maxBackoff: number = 30000; // 30 seconds

  constructor(pollInterval: number = 3000) {
    this.pollInterval = pollInterval;
    this.setupVisibilityListener();
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isPageVisible = document.visibilityState === 'visible';
        if (this.isPageVisible) {
          // Resume polling at normal rate
          this.backoffMultiplier = 1;
          this.poll();
        }
      });
    }
  }

  async connect(): Promise<void> {
    if (this.isConnectedFlag) return;

    this.isConnectedFlag = true;
    this.poll();
  }

  async disconnect(): Promise<void> {
    this.isConnectedFlag = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
    this.seenIds.clear();
    this.subscribers.clear();
  }

  subscribe(callback: (notification: Notification) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  private async poll() {
    if (!this.isConnectedFlag) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications?since=${this.lastPollAt}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          notifications: Notification[];
        };

        // Emit new notifications (dedup by ID)
        for (const notification of data.notifications) {
          if (!this.seenIds.has(notification.id)) {
            this.seenIds.add(notification.id);
            this.subscribers.forEach(cb => cb(notification));
          }
        }

        this.lastPollAt = Date.now();
        this.backoffMultiplier = 1; // Reset backoff on success
      }
    } catch (err) {
      console.error('Polling error:', err);
      // Backoff on error (but only if tab is visible)
      if (this.isPageVisible) {
        this.backoffMultiplier = Math.min(
          this.backoffMultiplier * 1.5,
          this.maxBackoff / this.pollInterval
        );
      }
    }

    // Schedule next poll with optional backoff
    const delay = this.isPageVisible
      ? this.pollInterval * this.backoffMultiplier
      : this.pollInterval * 3; // Slower when hidden

    if (this.isConnectedFlag) {
      this.pollTimer = setTimeout(() => this.poll(), delay);
    }
  }
}

// SSE Transport — Example stub for server-sent events
export class SseTransport implements NotificationsTransport {
  private eventSource?: EventSource;
  private isConnectedFlag: boolean = false;
  private subscribers: Set<(notification: Notification) => void> = new Set();

  async connect(): Promise<void> {
    if (this.isConnectedFlag) return;

    try {
      this.eventSource = new EventSource(`${API_URL}/api/notifications/events`, {
        withCredentials: true,
      });

      this.eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification;
          this.subscribers.forEach(cb => cb(notification));
        } catch (err) {
          console.error('Failed to parse SSE event:', err);
        }
      });

      this.eventSource.addEventListener('error', () => {
        this.disconnect();
      });

      this.isConnectedFlag = true;
    } catch (err) {
      console.error('SSE connection error:', err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    this.isConnectedFlag = false;
    this.subscribers.clear();
  }

  subscribe(callback: (notification: Notification) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }
}

// No-op Transport — For testing or when realtime is disabled
export class NoOpTransport implements NotificationsTransport {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  subscribe(): () => void {
    return () => {};
  }
  isConnected(): boolean {
    return false;
  }
}
