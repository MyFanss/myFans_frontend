export type UserRole = "creator" | "fan";

export type CreatorCategory =
  | "All"
  | "Music"
  | "Art"
  | "Gaming"
  | "Fashion"
  | "Fitness"
  | "Tech"
  | "Food"
  | "Travel";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  subscriberCount: number;
  isSubscribed: boolean;
  category: CreatorCategory;
}

export interface CreatorPostPreview {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
}

export interface CreatorProfile {
  id: string;
  userId?: string;
  handle: string;
  name: string;
  displayName: string;
  bio: string;
  category: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  subscriberCount: number;
  isSubscribed?: boolean;
  recentPosts?: CreatorPostPreview[];
}

export interface Subscription {
  id: string;
  creatorId: string;
  fanId?: string;
  userId?: string;
  status?: "active" | "cancelled" | "expired";
  createdAt?: string;
  subscribedAt?: string;
  cancelledAt?: string;
  expiresAt?: string;
}

export type PostVisibility = "public" | "subscribers";

export interface Post {
  id: string;
  title: string;
  body: string;
  visibility: PostVisibility;
  mediaUrl?: string;
  authorId: string;
  createdAt: string;
}
