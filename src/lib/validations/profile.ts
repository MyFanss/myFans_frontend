import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be 50 characters or fewer"),
  bio: z
    .string()
    .max(300, "Bio must be 300 characters or fewer")
    .optional()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .url("Enter a valid URL (e.g. https://example.com/avatar.jpg)")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
