"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Session } from "@/lib/api/sessions";
import { logoutSession, logoutAllOtherSessions } from "@/lib/api/sessions";

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Props {
  sessions: Session[];
  onSessionsChange: (sessions: Session[]) => void;
}

export function SessionList({ sessions, onSessionsChange }: Props) {
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleLogout(sessionId: string) {
    setLoading(sessionId);
    await logoutSession(sessionId);
    onSessionsChange(sessions.filter((s) => s.id !== sessionId));
    setLoading(null);
  }

  async function handleLogoutAll() {
    setLoading("all");
    await logoutAllOtherSessions();
    onSessionsChange(sessions.filter((s) => s.isCurrent));
    setLoading(null);
    setConfirmLogoutAll(false);
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <section aria-labelledby="sessions-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="sessions-heading" className="text-lg font-semibold">
          Active Sessions
        </h2>
        {otherSessions.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmLogoutAll(true)}
            disabled={loading === "all"}
          >
            {loading === "all" ? "Logging out…" : "Log out all other sessions"}
          </Button>
        )}
      </div>

      <ul className="space-y-3" role="list">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-4"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{session.deviceLabel}</span>
                {session.isCurrent && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {session.ipAddress && <span>{session.ipAddress} · </span>}
                Last active {formatLastActive(session.lastActive)}
              </p>
            </div>
            {!session.isCurrent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLogout(session.id)}
                disabled={loading === session.id}
                className="self-start sm:self-auto shrink-0"
              >
                {loading === session.id ? "Logging out…" : "Log out"}
              </Button>
            )}
          </li>
        ))}
      </ul>

      {confirmLogoutAll && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl">
            <h3 id="confirm-title" className="text-base font-semibold mb-2">
              Log out all other sessions?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will end all sessions except your current one. You will need
              to log in again on those devices.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmLogoutAll(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogoutAll}
                disabled={loading === "all"}
              >
                {loading === "all" ? "Logging out…" : "Log out all"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
