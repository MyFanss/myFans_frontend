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
  email?: string;
  role?: UserRole;
  bio?: string;
  avatarUrl?: string;
  subscriberCount: number;
  isSubscribed: boolean;
  category?: CreatorCategory;
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
  creator?: Creator;
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

export interface FeedPost extends Post {
  author?: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export interface FeedResponse {
  posts: FeedPost[];
  cursor?: string;
  hasMore?: boolean;
}

export interface PayoutWallet {
  id: string;
  userId: string;
  address: string;
  provider: string;
  connectedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  body: string;
  createdAt: string;
  parentId?: string;
  likeCount: number;
  likedByMe: boolean;
  deleted: boolean;
}

export interface CommentCreateInput {
  postId: string;
  body: string;
  parentId?: string;
}

export interface CommentsResponse {
  comments: Comment[];
  cursor?: string;
  hasMore?: boolean;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  commentId?: string;
  createdAt: string;
}

export interface TipIntent {
  id: string;
  creatorId: string;
  userId: string;
  amount: number;
  currency: string;
  message?: string;
  status: "pending" | "confirmed" | "completed" | "failed" | "cancelled";
  idempotencyKey: string;
  expiresAt: string;
  createdAt: string;
}

export interface TipConfirmation {
  intentId: string;
  paymentMethodId?: string;
  nonce?: string;
}

export interface Tip {
  id: string;
  creatorId: string;
  userId: string;
  amount: number;
  currency: string;
  message?: string;
  status: "completed" | "failed";
  createdAt: string;
}

export interface FeeBreakdown {
  platformFee: number;
  creatorReceives: number;
  total: number;
  platformFeePercentage: number;
}

export interface TipConfig {
  minAmount: number;
  maxAmount: number;
  platformFeePercentage: number;
  currency: string;
  disabled?: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video" | "audio";
  mimeType: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface UploadedMedia {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface UploadProgress {
  itemId: string;
  loaded: number;
  total: number;
  progress: number;
}

export interface MediaValidationError {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "TOTAL_TOO_LARGE" | "INVALID_DIMENSIONS" | "SPOOFED_FILE";
  message: string;
  field?: string;
}
