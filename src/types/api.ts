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

export interface Subscription {
  id: string;
  creatorId: string;
  createdAt: string;
}

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
  handle: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  category?: string;
  subscriberCount: number;
  isSubscribed?: boolean;
}

export interface Subscription {
  id: string;
  creatorId: string;
  fanId: string;
  status: "active" | "cancelled";
  subscribedAt: string;
  cancelledAt?: string;
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
