"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings navigation" className="flex gap-0.5 -mb-px">
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            pathname === href
              ? "text-zinc-100 border-white"
              : "text-zinc-500 hover:text-zinc-300 border-transparent"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
