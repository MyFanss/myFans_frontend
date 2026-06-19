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

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  isVerified?: boolean;
  category?: string;
}
