"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Theme-aware wrapper around Sonner's `Toaster`, mounted once in the root
 * layout. Toasts auto-dismiss after `duration` (default 4s) and stack
 * without overlapping; Sonner announces them via an `aria-live` region.
 */
const Toaster = ({ duration = 4000, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={duration}
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
