import { setAuthCookie, clearAuthCookie } from "@/lib/auth/session";

export const ACCESS_TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    setAuthCookie(token);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to store access token");
    }
  }
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    clearAuthCookie();
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to clear access token");
    }
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to store refresh token");
    }
  }
}

export function clearRefreshToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to clear refresh token");
    }
  }
}

export function clearAllTokens(): void {
  clearAccessToken();
  clearRefreshToken();
}
