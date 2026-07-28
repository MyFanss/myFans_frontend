import { Message, OptimisticMessage } from '@/types/messages';

// Create an optimistic message for UI before server ack
export function createOptimisticMessage(
  threadId: string,
  content: string,
  senderId: string,
  clientId: string
): OptimisticMessage {
  return {
    id: clientId, // Temporary ID
    clientId,
    threadId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    isOptimistic: true,
    isPending: true,
  };
}

// Reconcile optimistic message with server response
export function reconcileMessage(
  optimisticMessage: OptimisticMessage,
  serverMessage: Message
): OptimisticMessage {
  return {
    ...serverMessage,
    isOptimistic: false,
    isPending: false,
  };
}

// Mark optimistic message as failed
export function markMessageFailed(
  message: OptimisticMessage,
  error: string
): OptimisticMessage {
  return {
    ...message,
    failedToSend: true,
    isPending: false,
  };
}

// Deduplicate messages by ID when mixing optimistic + fetched
export function dedupeMessages(
  messages: OptimisticMessage[],
  newMessages: Message[]
): OptimisticMessage[] {
  const seen = new Map<string, OptimisticMessage>();

  // Add existing messages first (preserve optimistic state)
  for (const msg of messages) {
    if (!seen.has(msg.id)) {
      seen.set(msg.id, msg);
    }
  }

  // Add new messages, but don't replace optimistic ones with same clientId
  for (const msg of newMessages) {
    const existing = seen.get(msg.id);
    if (!existing) {
      seen.set(msg.id, {
        ...msg,
        isOptimistic: false,
        isPending: false,
      });
    } else if (existing.clientId === msg.id) {
      // This is the server ack for an optimistic message
      seen.set(msg.id, reconcileMessage(existing, msg));
    }
  }

  return Array.from(seen.values());
}

// Group messages by day for display
export interface MessageGroup {
  date: string;
  messages: OptimisticMessage[];
}

export function groupMessagesByDay(messages: OptimisticMessage[]): MessageGroup[] {
  const groups = new Map<string, OptimisticMessage[]>();

  for (const msg of messages) {
    const date = new Date(msg.createdAt);
    const dateKey = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(msg);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, messages]) => ({
      date,
      messages: messages.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }));
}

// Format timestamp for message bubble
export function formatMessageTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Check if message is from current user
export function isOwnMessage(message: OptimisticMessage, currentUserId: string): boolean {
  return message.senderId === currentUserId;
}

// Build retry message for failed send
export function buildRetryMessage(
  failedMessage: OptimisticMessage
): { content: string; clientId: string } {
  return {
    content: failedMessage.content,
    clientId: failedMessage.clientId || `retry-${Date.now()}`,
  };
}

// Check if any message in thread failed
export function hasFailedMessages(messages: OptimisticMessage[]): boolean {
  return messages.some(msg => msg.failedToSend);
}

// Get count of failed messages
export function getFailedMessageCount(messages: OptimisticMessage[]): number {
  return messages.filter(msg => msg.failedToSend).length;
}

// Sanitize pasted text to plain text
export function sanitizeMessageText(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, match => {
      // Decode HTML entities
      const div = document.createElement('div');
      div.innerHTML = match;
      return div.textContent || match;
    })
    .slice(0, 5000); // Max length
}

// Validate message content before send
export function validateMessage(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (content.length > 5000) {
    return { valid: false, error: 'Message is too long (max 5000 characters)' };
  }
  return { valid: true };
}
