"use client";

import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import type { User } from "@/types/api";

export interface AuthUser extends User {
  displayName?: string;
  handle?: string;
  bio?: string;
  categories?: string[];
}

export function useAuth() {
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();

  return {
    user: user as AuthUser | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
}
