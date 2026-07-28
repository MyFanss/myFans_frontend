import { api } from "@/lib/api/client";
import type { Comment, CommentCreateInput, CommentsResponse } from "@/types/api";

export interface LikePostParams {
  postId: string;
}

export interface UnlikePostParams {
  postId: string;
}

export interface GetCommentsParams {
  postId: string;
  cursor?: string;
  limit?: number;
}

export interface CreateCommentParams {
  postId: string;
  body: string;
  parentId?: string;
}

export interface DeleteCommentParams {
  commentId: string;
}

export interface LikeCommentParams {
  commentId: string;
}

export interface UnlikeCommentParams {
  commentId: string;
}

// Like/Unlike Post
export async function likePost({ postId }: LikePostParams): Promise<{ success: boolean }> {
  return api.post(`/posts/${postId}/like`);
}

export async function unlikePost({ postId }: UnlikePostParams): Promise<{ success: boolean }> {
  return api.delete(`/posts/${postId}/like`);
}

// Comments
export async function getComments({
  postId,
  cursor,
  limit = 20,
}: GetCommentsParams): Promise<CommentsResponse> {
  return api.get(`/posts/${postId}/comments`, {
    params: {
      ...(cursor && { cursor }),
      limit,
    },
  });
}

export async function createComment({
  postId,
  body,
  parentId,
}: CreateCommentParams): Promise<Comment> {
  return api.post(`/posts/${postId}/comments`, {
    body,
    ...(parentId && { parentId }),
  });
}

export async function deleteComment({ commentId }: DeleteCommentParams): Promise<{ success: boolean }> {
  return api.delete(`/comments/${commentId}`);
}

// Like/Unlike Comment
export async function likeComment({ commentId }: LikeCommentParams): Promise<{ success: boolean }> {
  return api.post(`/comments/${commentId}/like`);
}

export async function unlikeComment({ commentId }: UnlikeCommentParams): Promise<{ success: boolean }> {
  return api.delete(`/comments/${commentId}/like`);
}
