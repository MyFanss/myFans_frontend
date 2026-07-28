// Direct Messages Types

export interface User {
  id: string;
  displayName: string;
  handle: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    metadata?: Record<string, any>;
  }>;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  failedToSend?: boolean; // Optimistic send failure
  clientId?: string; // Temporary ID for optimistic sends
}

export interface Thread {
  id: string;
  participantIds: string[]; // [userId, otherUserId] for 1:1
  participant: User; // The other person (not current user)
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount: number;
  isMuted: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
  participantDeleted?: boolean; // Other user deleted account
  createdAt: string;
}

// API Responses
export interface ThreadsListResponse {
  threads: Thread[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface MessagesPageResponse {
  messages: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface SendMessageRequest {
  threadId: string;
  content: string;
  attachmentIds?: string[];
  clientId?: string; // For idempotency and optimistic reconcile
}

export interface SendMessageResponse {
  message: Message;
  reconcileId?: string; // Maps clientId to server id
}

export interface MarkThreadReadRequest {
  threadId: string;
}

export interface MarkThreadReadResponse {
  success: boolean;
}

// Optimistic State
export interface OptimisticMessage extends Message {
  isOptimistic: boolean;
  isPending: boolean; // Currently being sent
}

// Polling/Transport
export interface MessagePollingState {
  isPolling: boolean;
  lastPollAt?: number;
  pollInterval: number; // ms
  isPageVisible: boolean; // Pause polling if tab not focused
}

// Thread Context
export interface ThreadContextData {
  threadId: string;
  isOpen: boolean;
  unreadCount: number;
}

// Search
export interface ThreadSearchParams {
  query?: string;
  archived?: boolean;
  limit?: number;
}

export interface ThreadSearchResult {
  threads: Thread[];
  total: number;
}

// UI States
export interface MessageListState {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  isEmpty: boolean;
  scrollPosition?: number;
}

export interface ThreadListState {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  isEmpty: boolean;
  selectedThreadId?: string;
}

// Failure Recovery
export interface FailedMessageAction {
  messageId: string;
  action: 'retry' | 'delete';
}

export interface MessageSendError {
  clientId: string;
  reason: 'validation' | 'network' | 'server' | 'timeout';
  message: string;
  retryable: boolean;
}
