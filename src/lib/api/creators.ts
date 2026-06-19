import type { CreatorProfile } from "@/types/api";

type ApiCreatorPayload = Partial<CreatorProfile> & {
  name?: string;
  data?: ApiCreatorPayload;
};

const MOCK_CREATORS: Record<string, CreatorProfile> = {
  luna: {
    id: "creator_luna",
    userId: "user_luna",
    handle: "luna",
    name: "Luna Vale",
    displayName: "Luna Vale",
    bio: "Cosplay designer sharing build diaries, behind-the-scenes shoots, and monthly fan polls.",
    category: "Cosplay",
    avatarUrl: null,
    bannerUrl: null,
    subscriberCount: 18420,
    isSubscribed: false,
    recentPosts: [
      {
        id: "post_luna_1",
        title: "Armor foam workflow",
        excerpt: "A quick look at how this month's shoulder pieces came together.",
        publishedAt: "2026-06-12",
      },
      {
        id: "post_luna_2",
        title: "June character poll",
        excerpt: "Subscribers are voting on the next full-build reveal.",
        publishedAt: "2026-06-05",
      },
    ],
  },
  marco: {
    id: "creator_marco",
    userId: "user_marco",
    handle: "marco",
    name: "Marco Stone",
    displayName: "Marco Stone",
    bio: "Strength coach posting compact training blocks, recovery notes, and subscriber-only form checks.",
    category: "Fitness",
    avatarUrl: null,
    bannerUrl: null,
    subscriberCount: 9320,
    isSubscribed: false,
    recentPosts: [
      {
        id: "post_marco_1",
        title: "Four-week pull plan",
        excerpt: "A simple progression for stronger rows, pull-ups, and grip work.",
        publishedAt: "2026-06-10",
      },
    ],
  },
  nova: {
    id: "creator_nova",
    userId: "user_nova",
    handle: "nova",
    name: "Nova Quinn",
    displayName: "Nova Quinn",
    bio: "Digital artist creating process breakdowns, brush packs, and long-form critique streams.",
    category: "Art",
    avatarUrl: null,
    bannerUrl: null,
    subscriberCount: 12780,
    isSubscribed: false,
    recentPosts: [],
  },
};

function normalizeHandle(handle: string): string {
  return decodeURIComponent(handle).trim().replace(/^@/, "").toLowerCase();
}

function getApiUrl(): string | null {
  return process.env.NEXT_PUBLIC_API_URL || null;
}

function normalizeCreatorPayload(payload: ApiCreatorPayload): CreatorProfile | null {
  const source = payload.data ?? payload;
  const handle = typeof source.handle === "string" ? normalizeHandle(source.handle) : "";

  if (!source.id || !handle) {
    return null;
  }

  const displayName = source.displayName || source.name || handle;

  return {
    id: source.id,
    userId: source.userId,
    handle,
    name: source.name || displayName,
    displayName,
    bio: source.bio || "",
    category: source.category || "Creator",
    avatarUrl: source.avatarUrl ?? null,
    bannerUrl: source.bannerUrl ?? null,
    subscriberCount: source.subscriberCount ?? 0,
    isSubscribed: source.isSubscribed ?? false,
    recentPosts: source.recentPosts ?? [],
  };
}

export function getMockCreatorByHandle(handle: string): CreatorProfile | null {
  const normalizedHandle = normalizeHandle(handle);
  return MOCK_CREATORS[normalizedHandle] ?? null;
}

async function fetchCreatorByHandle(handle: string): Promise<CreatorProfile | null> {
  const apiUrl = getApiUrl();

  if (!apiUrl) {
    return null;
  }

  const normalizedHandle = normalizeHandle(handle);
  const url = new URL(`/creators/${encodeURIComponent(normalizedHandle)}`, apiUrl);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load creator ${normalizedHandle}`);
  }

  const payload = (await response.json()) as ApiCreatorPayload;
  return normalizeCreatorPayload(payload);
}

export async function getCreatorByHandle(
  handle: string
): Promise<CreatorProfile | null> {
  const normalizedHandle = normalizeHandle(handle);

  if (!normalizedHandle) {
    return null;
  }

  try {
    return (
      (await fetchCreatorByHandle(normalizedHandle)) ??
      getMockCreatorByHandle(normalizedHandle)
    );
  } catch {
    return getMockCreatorByHandle(normalizedHandle);
  }
}
