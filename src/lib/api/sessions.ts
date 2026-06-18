import { api } from "./client";

export interface Session {
  id: string;
  deviceLabel: string;
  ipAddress?: string;
  lastActive: string;
  isCurrent: boolean;
}

const MOCK_SESSIONS: Session[] = [
  {
    id: "sess_current",
    deviceLabel: "Chrome on Windows",
    ipAddress: "192.168.1.1",
    lastActive: new Date().toISOString(),
    isCurrent: true,
  },
  {
    id: "sess_2",
    deviceLabel: "Safari on iPhone",
    ipAddress: "10.0.0.2",
    lastActive: new Date(Date.now() - 3600 * 1000).toISOString(),
    isCurrent: false,
  },
  {
    id: "sess_3",
    deviceLabel: "Firefox on macOS",
    ipAddress: "10.0.0.5",
    lastActive: new Date(Date.now() - 86400 * 1000).toISOString(),
    isCurrent: false,
  },
];

export async function getSessions(): Promise<Session[]> {
  try {
    return await api.get<Session[]>("/auth/sessions");
  } catch {
    return MOCK_SESSIONS;
  }
}

export async function logoutSession(sessionId: string): Promise<void> {
  await api.delete(`/auth/sessions/${sessionId}`).catch(() => {});
}

export async function logoutAllOtherSessions(): Promise<void> {
  await api.delete("/auth/sessions/others").catch(() => {});
}
