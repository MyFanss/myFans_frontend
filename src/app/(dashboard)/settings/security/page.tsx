"use client";

import { useEffect, useState } from "react";
import { SessionList } from "@/components/settings/SessionList";
import { PasswordChangeForm } from "@/components/settings/PasswordChangeForm";
import { getSessions, type Session } from "@/lib/api/sessions";

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(() => setError("Failed to load sessions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      <section aria-labelledby="sessions-section">
        {loading && (
          <p className="text-sm text-muted-foreground" role="status">
            Loading sessions…
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && (
          <SessionList sessions={sessions} onSessionsChange={setSessions} />
        )}
      </section>

      <hr className="border-border" />

      <PasswordChangeForm />
    </div>
  );
}
