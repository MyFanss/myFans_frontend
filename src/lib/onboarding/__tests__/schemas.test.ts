import { describe, it, expect } from 'vitest';
import {
  identitySchema,
  profileSchema,
  monetizationSchema,
  contentSchema,
  onboardingSchema,
  validateStep,
} from '../schemas';

describe('Onboarding Schemas', () => {
  describe('Identity Schema', () => {
    it('should accept valid identity data', () => {
      const data = {
        displayName: 'John Doe',
        handle: 'johndoe',
        avatar: 'https://example.com/avatar.jpg',
      };
      const result = identitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid display name (too short)', () => {
      const data = {
        displayName: 'J',
        handle: 'johndoe',
      };
      const result = identitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid handle (too short)', () => {
      const data = {
        displayName: 'John Doe',
        handle: 'jd',
      };
      const result = identitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid handle characters', () => {
      const data = {
        displayName: 'John Doe',
        handle: 'john@doe',
      };
      const result = identitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept handle with valid characters', () => {
      const data = {
        displayName: 'John Doe',
        handle: 'john_doe-123',
      };
      const result = identitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid avatar URL', () => {
      const data = {
        displayName: 'John Doe',
        handle: 'johndoe',
        avatar: 'not-a-url',
      };
      const result = identitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Profile Schema', () => {
    it('should accept valid profile data', () => {
      const data = {
        bio: 'A passionate creator',
        categories: ['music', 'gaming'],
        socialLinks: {
          twitter: 'https://twitter.com/johndoe',
          instagram: 'https://instagram.com/johndoe',
        },
      };
      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing categories', () => {
      const data = {
        bio: 'A passionate creator',
        categories: [],
        socialLinks: {},
      };
      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject too many categories', () => {
      const data = {
        bio: 'A passionate creator',
        categories: ['a', 'b', 'c', 'd', 'e', 'f'],
        socialLinks: {},
      };
      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject bio that is too long', () => {
      const data = {
        bio: 'a'.repeat(501),
        categories: ['music'],
        socialLinks: {},
      };
      const result = profileSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Monetization Schema', () => {
    it('should accept valid monetization data', () => {
      const data = {
        payoutMethod: 'bank_transfer',
        kycCompleted: false,
        termsAccepted: true,
      };
      const result = monetizationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept paypal as payout method', () => {
      const data = {
        payoutMethod: 'paypal',
        kycCompleted: false,
        termsAccepted: true,
      };
      const result = monetizationSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject if terms not accepted', () => {
      const data = {
        payoutMethod: 'bank_transfer',
        kycCompleted: false,
        termsAccepted: false,
      };
      const result = monetizationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid payout method', () => {
      const data = {
        payoutMethod: 'invalid_method',
        kycCompleted: false,
        termsAccepted: true,
      };
      const result = monetizationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Content Schema', () => {
    it('should accept content with draft', () => {
      const data = {
        hasDraft: true,
        draftTitle: 'My First Post',
        skippedContent: false,
      };
      const result = contentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept content with skipped flag', () => {
      const data = {
        hasDraft: false,
        skippedContent: true,
      };
      const result = contentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept minimal content', () => {
      const data = {
        hasDraft: false,
        skippedContent: false,
      };
      const result = contentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Complete Onboarding Schema', () => {
    it('should accept complete onboarding data', () => {
      const data = {
        identity: {
          displayName: 'John Doe',
          handle: 'johndoe',
        },
        profile: {
          bio: 'A passionate creator',
          categories: ['music'],
          socialLinks: {},
        },
        monetization: {
          payoutMethod: 'bank_transfer',
          kycCompleted: false,
          termsAccepted: true,
        },
        content: {
          hasDraft: false,
          skippedContent: true,
        },
      };
      const result = onboardingSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject incomplete onboarding data', () => {
      const data = {
        identity: {
          displayName: 'John Doe',
          handle: '',
        },
        profile: {
          bio: 'A passionate creator',
          categories: [],
          socialLinks: {},
        },
        monetization: {
          payoutMethod: '',
          kycCompleted: false,
          termsAccepted: false,
        },
        content: {
          hasDraft: false,
          skippedContent: false,
        },
      };
      const result = onboardingSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateStep Helper', () => {
    it('should validate step 1 (identity)', () => {
      const result = validateStep(1, {
        displayName: 'John Doe',
        handle: 'johndoe',
      });
      expect(result.success).toBe(true);
    });

    it('should return error for invalid step 1 data', () => {
      const result = validateStep(1, {
        displayName: '',
        handle: 'jd',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate step 2 (profile)', () => {
      const result = validateStep(2, {
        bio: 'Creator bio',
        categories: ['music'],
        socialLinks: {},
      });
      expect(result.success).toBe(true);
    });

    it('should validate step 3 (monetization)', () => {
      const result = validateStep(3, {
        payoutMethod: 'bank_transfer',
        kycCompleted: false,
        termsAccepted: true,
      });
      expect(result.success).toBe(true);
    });

    it('should validate step 4 (content)', () => {
      const result = validateStep(4, {
        hasDraft: false,
        skippedContent: true,
      });
      expect(result.success).toBe(true);
    });

    it('should validate step 5 (complete schema)', () => {
      const result = validateStep(5, {
        identity: {
          displayName: 'John Doe',
          handle: 'johndoe',
        },
        profile: {
          bio: 'Creator',
          categories: ['music'],
          socialLinks: {},
        },
        monetization: {
          payoutMethod: 'bank_transfer',
          termsAccepted: true,
        },
        content: {
          hasDraft: false,
          skippedContent: true,
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
