export const queryKeys = {
  users: {
    all: ["users"] as const,
    current: () => ["users", "current"] as const,
    detail: (id: string) => ["users", id] as const,
  },
  creators: {
    all: ["creators"] as const,
    lists: () => ["creators", "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.creators.lists(), filters] as const,
    details: () => ["creators", "detail"] as const,
    detail: (handle: string) =>
      [...queryKeys.creators.details(), handle] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    lists: () => ["subscriptions", "list"] as const,
    list: (userId?: string) =>
      [...queryKeys.subscriptions.lists(), userId] as const,
  },
};
