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

export interface Creator extends User {
  name: string;
  handle: string;
  bio?: string;
  avatarUrl?: string;
  subscriberCount: number;
  isSubscribed: boolean;
}

export interface Subscription {
  id: string;
  creatorId: string;
  fanId: string;
  createdAt: string;
  creator?: Creator;
}
