import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAllTokens,
} from "@/lib/auth/token-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
};

let isRefreshing = false;
let pendingQueue: QueueEntry[] = [];

function drainQueue(token: string | null, error?: Error): void {
  const queue = pendingQueue;
  pendingQueue = [];
  for (const entry of queue) {
    if (token !== null) {
      entry.resolve(token);
    } else {
      entry.reject(error ?? new Error("Token refresh failed"));
    }
  }
}

/** Reset module-level state — only for use in tests. */
export function resetRefreshState(): void {
  isRefreshing = false;
  pendingQueue = [];
}

/**
 * Fetches a new access token using the stored refresh token.
 * Implements a single-flight pattern: concurrent callers queue behind a single
 * in-flight request and all receive the same new token.
 * On failure, clears all tokens and redirects to /login.
 */
export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Refresh request failed with status ${response.status}`);
    }

    const data: RefreshResponse = await response.json();
    const newAccessToken = data.access_token;

    setAccessToken(newAccessToken);
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token);
    }

    drainQueue(newAccessToken);
    return newAccessToken;
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Token refresh failed");

    clearAllTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    drainQueue(null, error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}
