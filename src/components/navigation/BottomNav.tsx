"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Discover",
    href: "/discover",
    Icon: Compass,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    Icon: Home,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    Icon: Heart,
  },
  {
    label: "Profile",
    href: "/profile",
    Icon: User,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        // Fixed to bottom, full width, above content
        "fixed bottom-0 inset-x-0 z-50",
        // Background + top border
        "bg-background border-t border-border",
        // Safe-area inset for iPhone home indicator
        "pb-[env(safe-area-inset-bottom)]",
        // Desktop: sidebar handles navigation — hide this bar
        "md:hidden",
      )}
    >
      <ul className="flex min-h-[3.5rem]">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // Fill the full tap area — min 44px guaranteed by the parent min-h-[3.5rem]
                  "flex flex-col items-center justify-center gap-1 h-full w-full min-h-[44px]",
                  // Smooth colour transition
                  "transition-colors duration-150",
                  isActive
                    ? "text-rose-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 1.5 : 1.5}
                  // Filled on active, transparent fill (outline) when inactive
                  fill={isActive ? "currentColor" : "none"}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium leading-none">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
