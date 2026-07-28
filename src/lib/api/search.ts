import type { Creator } from "@/types/api";
import { api } from "./client";

export interface SearchResult {
  creators: Creator[];
  posts: {
    id: string;
    title: string;
    excerpt: string;
    authorHandle: string;
    authorName: string;
  }[];
  settings: {
    label: string;
    href: string;
  }[];
}

const QUICK_LINKS: SearchResult["settings"] = [
  { label: "Profile Settings", href: "/settings/profile" },
  { label: "Security Settings", href: "/settings/security" },
  { label: "Payout Settings", href: "/settings/payouts" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Discover", href: "/discover" },
];

function getMockSearchResults(query: string): SearchResult {
  const q = query.trim().toLowerCase();
  const allCreators: Creator[] = [
    {
      id: "creator_luna",
      name: "Luna Vale",
      handle: "luna",
      bio: "Cosplay designer sharing build diaries, behind-the-scenes shoots, and monthly fan polls.",
      avatarUrl: undefined,
      subscriberCount: 18420,
      isSubscribed: false,
      category: "Fashion",
    },
    {
      id: "creator_marco",
      name: "Marco Stone",
      handle: "marco",
      bio: "Strength coach posting compact training blocks, recovery notes, and subscriber-only form checks.",
      avatarUrl: undefined,
      subscriberCount: 9320,
      isSubscribed: false,
      category: "Fitness",
    },
    {
      id: "creator_nova",
      name: "Nova Quinn",
      handle: "nova",
      bio: "Digital artist creating process breakdowns, brush packs, and long-form critique streams.",
      avatarUrl: undefined,
      subscriberCount: 12780,
      isSubscribed: false,
      category: "Art",
    },
  ];

  const matchingCreators = allCreators.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      (c.bio && c.bio.toLowerCase().includes(q))
  );

  const matchingPosts: SearchResult["posts"] = [];
  const mockPosts: SearchResult["posts"] = [
    {
      id: "post_luna_1",
      title: "Armor foam workflow",
      excerpt: "A quick look at how this month's shoulder pieces came together.",
      authorHandle: "luna",
      authorName: "Luna Vale",
    },
    {
      id: "post_luna_2",
      title: "June character poll",
      excerpt: "Subscribers are voting on the next full-build reveal.",
      authorHandle: "luna",
      authorName: "Luna Vale",
    },
    {
      id: "post_marco_1",
      title: "Four-week pull plan",
      excerpt: "A simple progression for stronger rows, pull-ups, and grip work.",
      authorHandle: "marco",
      authorName: "Marco Stone",
    },
  ];

  for (const p of mockPosts) {
    if (
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q)
    ) {
      matchingPosts.push(p);
    }
  }

  const matchingSettings = QUICK_LINKS.filter((s) =>
    s.label.toLowerCase().includes(q)
  );

  return {
    creators: matchingCreators,
    posts: matchingPosts,
    settings: matchingSettings,
  };
}

export async function search(q: string): Promise<SearchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl || !q.trim()) {
    return getMockSearchResults(q);
  }

  try {
    const data = await api.get<SearchResult>("/search", {
      params: { q: q.trim() },
    });
    return data;
  } catch {
    return getMockSearchResults(q);
  }
}
