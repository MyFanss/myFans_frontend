import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <nav aria-label="Settings navigation" className="flex gap-1 border-b mb-8">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-sm font-medium rounded-t-md hover:bg-accent transition-colors aria-[current=page]:border-b-2 aria-[current=page]:border-primary"
          >
            {label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
