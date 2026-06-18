import { z } from "zod";

export const POST_TITLE_MAX_LENGTH = 120;
export const POST_BODY_MAX_LENGTH = 5000;

export const postVisibilitySchema = z.enum(["public", "subscribers"]);

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(
      POST_TITLE_MAX_LENGTH,
      `Title must be ${POST_TITLE_MAX_LENGTH} characters or fewer`
    ),
  body: z
    .string()
    .trim()
    .min(1, "Body is required")
    .max(
      POST_BODY_MAX_LENGTH,
      `Body must be ${POST_BODY_MAX_LENGTH} characters or fewer`
    ),
  visibility: postVisibilitySchema,
  mediaUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type PostVisibility = z.infer<typeof postVisibilitySchema>;
