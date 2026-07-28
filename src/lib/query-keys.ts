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
    analytics: (range: string) => ["creators", "analytics", range] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    lists: () => ["subscriptions", "list"] as const,
    list: (userId?: string) =>
      [...queryKeys.subscriptions.lists(), userId] as const,
  },
  payouts: {
    all: ["payouts"] as const,
    wallet: () => ["payouts", "wallet"] as const,
  },
  feed: {
    all: ["feed"] as const,
    infinite: (filter?: string) => ["feed", "infinite", filter ?? "all"] as const,
  },
  interactions: {
    all: ["interactions"] as const,
    comments: (postId: string) => ["interactions", "comments", postId] as const,
    commentsList: (postId: string, cursor?: string) =>
      [...queryKeys.interactions.comments(postId), cursor ?? "initial"] as const,
  },
};
