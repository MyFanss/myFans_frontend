import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mergeDrafts,
  createDraft,
  updateDraftStep,
  isDraftComplete,
  getDraftCompletionPercentage,
} from '../persistence';
import { OnboardingDraft, OnboardingFormData } from '@/types/onboarding';

describe('Onboarding Persistence', () => {
  describe('mergeDrafts', () => {
    it('should return null if both drafts are null', () => {
      const result = mergeDrafts(null, null);
      expect(result).toBeNull();
    });

    it('should return server draft if local is null', () => {
      const serverDraft = createDraft(1, { identity: { displayName: 'John' } });
      const result = mergeDrafts(serverDraft, null);
      expect(result).toEqual(serverDraft);
    });

    it('should return local draft if server is null', () => {
      const localDraft = createDraft(1, { identity: { displayName: 'John' } });
      const result = mergeDrafts(null, localDraft);
      expect(result).toEqual(localDraft);
    });

    it('should prefer server draft if newer', () => {
      const older = createDraft(1, { identity: { displayName: 'Old' } });
      const newer = {
        ...createDraft(2, { identity: { displayName: 'New' } }),
        updatedAt: older.updatedAt + 1000,
      };
      const result = mergeDrafts(newer, older);
      expect(result?.data.identity?.displayName).toBe('New');
    });

    it('should prefer local draft if newer', () => {
      const serverDraft = createDraft(1, { identity: { displayName: 'Server' } });
      const localDraft = {
        ...createDraft(2, { identity: { displayName: 'Local' } }),
        updatedAt: serverDraft.updatedAt + 1000,
      };
      const result = mergeDrafts(serverDraft, localDraft);
      expect(result?.data.identity?.displayName).toBe('Local');
    });

    it('should merge field-level when timestamps are equal', () => {
      const timestamp = Date.now();
      const server: OnboardingDraft = {
        step: 2,
        data: {
          identity: { displayName: 'John', handle: 'john' },
        },
        updatedAt: timestamp,
        version: '1.0',
      };
      const local: OnboardingDraft = {
        step: 2,
        data: {
          identity: { displayName: 'Jane' },
          profile: { bio: 'My bio', categories: [], socialLinks: {} },
        },
        updatedAt: timestamp,
        version: '1.0',
      };
      const result = mergeDrafts(server, local);
      expect(result?.data.identity?.displayName).toBe('Jane'); // Local overrides
      expect(result?.data.identity?.handle).toBe('john'); // Server preserved
      expect(result?.data.profile?.bio).toBe('My bio'); // Local field
    });
  });

  describe('createDraft', () => {
    it('should create a draft with current timestamp', () => {
      const before = Date.now();
      const draft = createDraft(1, { identity: { displayName: 'John' } });
      const after = Date.now();

      expect(draft.step).toBe(1);
      expect(draft.data.identity?.displayName).toBe('John');
      expect(draft.updatedAt).toBeGreaterThanOrEqual(before);
      expect(draft.updatedAt).toBeLessThanOrEqual(after);
    });

    it('should use provided version', () => {
      const draft = createDraft(1, {}, '2.0');
      expect(draft.version).toBe('2.0');
    });

    it('should default to version 1.0', () => {
      const draft = createDraft(1, {});
      expect(draft.version).toBe('1.0');
    });
  });

  describe('updateDraftStep', () => {
    it('should update step data', () => {
      const draft = createDraft(1, {});
      const updated = updateDraftStep(draft, 2, { bio: 'My bio', categories: [] });

      expect(updated.step).toBe(2);
      expect(updated.data.profile?.bio).toBe('My bio');
      expect(updated.updatedAt).toBeGreaterThan(draft.updatedAt);
    });

    it('should preserve existing data', () => {
      const draft = createDraft(1, {
        identity: { displayName: 'John', handle: 'john' },
      });
      const updated = updateDraftStep(draft, 2, { bio: 'My bio', categories: [] });

      expect(updated.data.identity?.displayName).toBe('John');
      expect(updated.data.profile?.bio).toBe('My bio');
    });

    it('should not go back to earlier steps', () => {
      const draft = createDraft(3, {});
      const updated = updateDraftStep(draft, 2, {});

      expect(updated.step).toBe(3); // Stays at 3
    });
  });

  describe('isDraftComplete', () => {
    it('should return false for incomplete draft', () => {
      const draft = createDraft(1, { identity: { displayName: 'John' } });
      expect(isDraftComplete(draft)).toBe(false);
    });

    it('should return true for complete draft', () => {
      const draft = createDraft(5, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
        content: { hasDraft: true },
      });
      expect(isDraftComplete(draft)).toBe(true);
    });

    it('should accept skipped content', () => {
      const draft = createDraft(5, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
        content: { skippedContent: true },
      });
      expect(isDraftComplete(draft)).toBe(true);
    });

    it('should require identity data', () => {
      const draft = createDraft(5, {
        identity: { displayName: 'John' }, // Missing handle
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
        content: { skippedContent: true },
      });
      expect(isDraftComplete(draft)).toBe(false);
    });

    it('should require profile categories', () => {
      const draft = createDraft(5, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: [] }, // Empty
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
        content: { skippedContent: true },
      });
      expect(isDraftComplete(draft)).toBe(false);
    });

    it('should require payout method and terms', () => {
      const draft = createDraft(5, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: '', termsAccepted: false }, // Invalid
        content: { skippedContent: true },
      });
      expect(isDraftComplete(draft)).toBe(false);
    });
  });

  describe('getDraftCompletionPercentage', () => {
    it('should return 0% for empty draft', () => {
      const draft = createDraft(1, {});
      expect(getDraftCompletionPercentage(draft)).toBe(0);
    });

    it('should calculate 20% for identity only', () => {
      const draft = createDraft(1, {
        identity: { displayName: 'John', handle: 'john' },
      });
      expect(getDraftCompletionPercentage(draft)).toBe(20);
    });

    it('should calculate 40% for identity and profile', () => {
      const draft = createDraft(2, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
      });
      expect(getDraftCompletionPercentage(draft)).toBe(40);
    });

    it('should calculate 60% for identity, profile, and monetization', () => {
      const draft = createDraft(3, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
      });
      expect(getDraftCompletionPercentage(draft)).toBe(60);
    });

    it('should calculate 80% for all steps except review', () => {
      const draft = createDraft(4, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
        content: { skippedContent: true },
      });
      expect(getDraftCompletionPercentage(draft)).toBe(80);
    });

    it('should calculate 100% for complete draft', () => {
      const draft = createDraft(5, {
        identity: { displayName: 'John', handle: 'john' },
        profile: { bio: 'Creator', categories: ['music'] },
        monetization: { payoutMethod: 'bank_transfer', termsAccepted: true },
        content: { skippedContent: true },
      });
      expect(getDraftCompletionPercentage(draft)).toBe(100);
    });
  });
});
