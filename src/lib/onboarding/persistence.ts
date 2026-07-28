import { OnboardingDraft, OnboardingFormData } from '@/types/onboarding';

const STORAGE_KEY = 'onboarding_draft_v1';

// Get draft from localStorage
export function getLocalDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to parse localStorage draft:', err);
    return null;
  }
}

// Save draft to localStorage
export function saveLocalDraft(draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Clear localStorage draft
export function clearLocalDraft(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear localStorage draft:', err);
  }
}

// Merge server and local drafts using conflict resolution rules
export function mergeDrafts(
  serverDraft: OnboardingDraft | null,
  localDraft: OnboardingDraft | null
): OnboardingDraft | null {
  if (!serverDraft && !localDraft) {
    return null;
  }

  if (!serverDraft) {
    return localDraft;
  }

  if (!localDraft) {
    return serverDraft;
  }

  // Server wins if newer (based on updatedAt timestamp)
  if (serverDraft.updatedAt > localDraft.updatedAt) {
    return serverDraft;
  }

  // If timestamps are equal, merge at field level (local fields override server)
  if (serverDraft.updatedAt === localDraft.updatedAt) {
    return {
      step: Math.max(serverDraft.step, localDraft.step),
      data: {
        ...serverDraft.data,
        ...localDraft.data,
      },
      updatedAt: serverDraft.updatedAt,
      version: serverDraft.version,
    };
  }

  // Local is newer
  return localDraft;
}

// Create draft object with current data
export function createDraft(
  step: number,
  data: Partial<OnboardingFormData>,
  version: string = '1.0'
): OnboardingDraft {
  return {
    step,
    data,
    updatedAt: Date.now(),
    version,
  };
}

// Update specific step in draft
export function updateDraftStep(
  draft: OnboardingDraft,
  step: number,
  stepData: any
): OnboardingDraft {
  return {
    ...draft,
    step: Math.max(draft.step, step),
    data: {
      ...draft.data,
      [getStepKey(step)]: stepData,
    },
    updatedAt: Date.now(),
  };
}

// Get step key from step number
function getStepKey(step: number): string {
  const keys = ['', 'identity', 'profile', 'monetization', 'content'];
  return keys[step] || '';
}

// Check if draft is complete (all required fields present)
export function isDraftComplete(draft: OnboardingDraft): boolean {
  const data = draft.data;
  return !!(
    data.identity?.displayName &&
    data.identity?.handle &&
    data.profile?.categories?.length &&
    data.monetization?.payoutMethod &&
    data.monetization?.termsAccepted &&
    (data.content?.hasDraft || data.content?.skippedContent)
  );
}

// Get completion percentage
export function getDraftCompletionPercentage(draft: OnboardingDraft): number {
  const data = draft.data;
  let completed = 0;
  const total = 5;

  if (data.identity?.displayName && data.identity?.handle) completed++;
  if (data.profile?.categories?.length) completed++;
  if (data.monetization?.payoutMethod && data.monetization?.termsAccepted) completed++;
  if (data.content?.hasDraft || data.content?.skippedContent) completed++;
  if (completed === 4) completed++; // Review step

  return Math.round((completed / total) * 100);
}
