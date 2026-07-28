import {
  Thread,
  ThreadsListResponse,
  Message,
  MessagesPageResponse,
  SendMessageRequest,
  SendMessageResponse,
  MarkThreadReadRequest,
  MarkThreadReadResponse,
} from '@/types/messages';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get threads list with pagination
export async function getThreads(
  cursor?: string,
  limit: number = 20
): Promise<ThreadsListResponse> {
  try {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await fetch(
      `${API_URL}/api/messages/threads?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch threads: ${response.statusText}`);
    }

    return (await response.json()) as ThreadsListResponse;
  } catch (err) {
    console.error('Error fetching threads:', err);
    throw err;
  }
}

// Get single thread details
export async function getThread(threadId: string): Promise<Thread> {
  try {
    const response = await fetch(`${API_URL}/api/messages/threads/${threadId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.status === 404) {
      throw new Error('Thread not found');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch thread: ${response.statusText}`);
    }

    return (await response.json()) as Thread;
  } catch (err) {
    console.error('Error fetching thread:', err);
    throw err;
  }
}

// Get messages in a thread with pagination
export async function getMessages(
  threadId: string,
  cursor?: string,
  limit: number = 30
): Promise<MessagesPageResponse> {
  try {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await fetch(
      `${API_URL}/api/messages/threads/${threadId}/messages?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return (await response.json()) as MessagesPageResponse;
  } catch (err) {
    console.error('Error fetching messages:', err);
    throw err;
  }
}

// Send a message (with idempotency via clientId)
export async function sendMessage(
  threadId: string,
  content: string,
  clientId?: string,
  attachmentIds?: string[]
): Promise<SendMessageResponse> {
  try {
    const payload: SendMessageRequest = {
      threadId,
      content,
      clientId,
      attachmentIds,
    };

    const response = await fetch(`${API_URL}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientId && { 'Idempotency-Key': clientId }),
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid message or thread');
      }
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return (await response.json()) as SendMessageResponse;
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
}

// Mark thread as read
export async function markThreadRead(threadId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/messages/threads/${threadId}/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark thread read: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error marking thread read:', err);
    throw err;
  }
}

// Delete a message
export async function deleteMessage(threadId: string, messageId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/api/messages/threads/${threadId}/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error deleting message:', err);
    throw err;
  }
}

// Start a new thread (create or get existing)
export async function startThread(participantId: string): Promise<Thread> {
  try {
    const response = await fetch(`${API_URL}/api/messages/threads/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ participantId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start thread: ${response.statusText}`);
    }

    return (await response.json()) as Thread;
  } catch (err) {
    console.error('Error starting thread:', err);
    throw err;
  }
}

// Search threads (client-side or server depending on API)
export async function searchThreads(query: string): Promise<Thread[]> {
  try {
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_URL}/api/messages/threads/search?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      // Fallback to empty if search not available
      return [];
    }

    const data = (await response.json()) as { threads: Thread[] };
    return data.threads;
  } catch (err) {
    console.error('Error searching threads:', err);
    return [];
  }
}

// Mute/unmute thread
export async function muteThread(threadId: string, mute: boolean): Promise<void> {
  try {
    const response = await fetch(
      `${API_URL}/api/messages/threads/${threadId}/mute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mute }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mute thread: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error muting thread:', err);
    throw err;
  }
}

// Block user (creates soft state in thread)
export async function blockUser(userId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/messages/block/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to block user: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error blocking user:', err);
    throw err;
  }
}

// Get presence (online status stub)
export async function getPresence(userId: string): Promise<{ isOnline: boolean }> {
  try {
    const response = await fetch(`${API_URL}/api/presence/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      return { isOnline: false };
    }

    return (await response.json()) as { isOnline: boolean };
  } catch (err) {
    console.error('Error fetching presence:', err);
    return { isOnline: false };
  }
}
