import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  setRefreshToken,
  clearAllTokens,
} from "@/lib/auth/token-store";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { ApiError, NetworkError } from "./errors";
import type { User } from "@/types/api";

const CURRENT_USER_STORAGE_KEY = "auth_user";

function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to store current user");
    }
  }
}

function clearCurrentUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to clear current user");
    }
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  /** Internal flag — prevents infinite retry loops on token refresh. */
  _retry?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, _retry, ...fetchOptions } = options;
  const url = new URL(endpoint, API_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const headers = new Headers(fetchOptions.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Silently refresh on expired access token, then retry once.
      if (
        response.status === 401 &&
        !_retry &&
        (data as Record<string, unknown> | null)?.code === "ACCESS_TOKEN_EXPIRED"
      ) {
        await refreshAccessToken();
        return request<T>(endpoint, { ...options, _retry: true });
      }

      throw new ApiError(
        response.status,
        data,
        data?.message || `HTTP ${response.status}`
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown network error"
    );
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  getToken: getAccessToken,
  setToken: setAccessToken,
  clearToken: clearAccessToken,
  setRefreshToken,
  clearAllTokens,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
};
