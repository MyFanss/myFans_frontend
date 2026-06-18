export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface Creator {
  id: string;
  handle: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  subscriberCount: number;
  isSubscribed?: boolean;
}

export interface Subscription {
  id: string;
  creatorId: string;
  creator: Creator;
  subscribedAt: string;
  expiresAt?: string;
}
