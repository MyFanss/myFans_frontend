import { api } from "./client";
import { ApiError, NetworkError } from "./errors";
import type { AuthResponse } from "@/types/api";
import type { LoginFormValues, SignupFormValues } from "@/lib/validations/auth";

export async function login(credentials: LoginFormValues): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  api.setToken(response.access_token);
  if (response.refresh_token) {
    api.setRefreshToken(response.refresh_token);
  }
  api.setCurrentUser(response.user);
  return response;
}

export async function signup(
  values: Pick<SignupFormValues, "email" | "password">
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/signup", values);
  api.setToken(response.access_token);
  if (response.refresh_token) {
    api.setRefreshToken(response.refresh_token);
  }
  api.setCurrentUser(response.user);
  return response;
}

export function logout(): void {
  api.clearAllTokens();
  api.clearCurrentUser();
}

/**
 * Extracts a human-readable message from an API or network error.
 * NestJS validation errors arrive as message arrays; credential/conflict
 * errors arrive as a single string.
 */
export function extractApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const data = error.data as { message?: string | string[] } | null;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(". ")
        : data.message;
    }
    return error.message;
  }
  if (error instanceof NetworkError) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return "An unexpected error occurred. Please try again.";
}
