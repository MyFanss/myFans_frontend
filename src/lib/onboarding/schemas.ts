import { z } from 'zod';

// Individual step schemas
export const identitySchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  handle: z
    .string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Handle can only contain letters, numbers, underscores, and hyphens'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

export const profileSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters'),
  categories: z
    .array(z.string())
    .min(1, 'Please select at least one category')
    .max(5, 'Select at most 5 categories'),
  socialLinks: z.object({
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
    tiktok: z.string().url('Invalid TikTok URL').optional().or(z.literal('')),
  }),
});

export const monetizationSchema = z.object({
  payoutMethod: z.enum(['bank_transfer', 'paypal', ''], {
    errorMap: () => ({ message: 'Please select a payout method' }),
  }),
  kycCompleted: z.boolean(),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, 'You must accept the terms to proceed'),
});

export const contentSchema = z.object({
  hasDraft: z.boolean(),
  draftTitle: z.string().optional(),
  skippedContent: z.boolean(),
});

// Composed complete schema
export const onboardingSchema = z.object({
  identity: identitySchema,
  profile: profileSchema,
  monetization: monetizationSchema,
  content: contentSchema,
});

export type IdentityFormData = z.infer<typeof identitySchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MonetizationFormData = z.infer<typeof monetizationSchema>;
export type ContentFormData = z.infer<typeof contentSchema>;
export type OnboardingFormSchema = z.infer<typeof onboardingSchema>;

// Helper to get schema for a specific step
export function getStepSchema(step: 1 | 2 | 3 | 4 | 5) {
  const schemas = {
    1: identitySchema,
    2: profileSchema,
    3: monetizationSchema,
    4: contentSchema,
    5: onboardingSchema,
  };
  return schemas[step];
}

// Helper to validate a step's data
export function validateStep(
  step: 1 | 2 | 3 | 4 | 5,
  data: unknown
): { success: boolean; error?: z.ZodError } {
  const schema = getStepSchema(step);
  const result = schema.safeParse(data);
  return {
    success: result.success,
    error: result.error,
  };
}
