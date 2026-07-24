"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const NAV_ITEMS = [
  { key: "nav.discover", href: "/discover", Icon: Compass },
  { key: "nav.dashboard", href: "/dashboard", Icon: Home },
  { key: "nav.subscriptions", href: "/subscriptions", Icon: Heart },
  { key: "nav.profile", href: "/profile", Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "fixed bottom-0 inset-x-0 z-50",
        "bg-background border-t border-border",
        "pb-[env(safe-area-inset-bottom)]",
        "md:hidden",
      )}
    >
      <ul className="flex min-h-[3.5rem]">
        {NAV_ITEMS.map(({ key, href, Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 h-full w-full min-h-[44px]",
                  "transition-colors duration-150",
                  isActive
                    ? "text-rose-500"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  fill={isActive ? "currentColor" : "none"}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium leading-none">
                  {t(key)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
