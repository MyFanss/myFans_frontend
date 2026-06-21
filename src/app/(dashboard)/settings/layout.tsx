import type { ReactNode } from "react";
import { SettingsNav } from "@/components/settings/SettingsNav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Page header */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-6 md:px-10 pt-8 pb-0">
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-zinc-500 mt-1 mb-6">
            Manage your account settings and profile preferences.
          </p>
          <SettingsNav />
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">
        {children}
      </div>
    </div>
  );
}
