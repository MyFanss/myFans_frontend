"use client";

import { showSuccess, showError, showInfo } from "@/lib/toast";

/**
 * Global toast hook for feature components (auth, settings, etc.). Backed by
 * Sonner (mounted once via `<Toaster />` in the root layout) — see
 * `@/lib/toast` for the underlying implementation.
 */
export function useToast() {
  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
  };
}
