export type UserRole = "creator" | "fan";

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

export interface CreatorPostPreview {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
}

export interface Creator {
  id: string;
  userId?: string;
  handle: string;
  name: string;
  displayName: string;
  bio?: string;
  category?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  subscriberCount: number;
  isSubscribed?: boolean;
}

export interface CreatorProfile extends Creator {
  bio: string;
  category: string;
  recentPosts?: CreatorPostPreview[];
}

export interface Subscription {
  id: string;
  creatorId: string;
  userId?: string;
  createdAt?: string;
}
