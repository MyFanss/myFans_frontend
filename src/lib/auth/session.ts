import type { NextRequest } from "next/server";
import { AUTH_TOKEN_COOKIE, COOKIE_MAX_AGE_SECONDS } from "./constants";

export { AUTH_TOKEN_COOKIE } from "./constants";

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export function isAuthenticatedFromRequest(request: NextRequest): boolean {
  return Boolean(getTokenFromRequest(request));
}

export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
}
