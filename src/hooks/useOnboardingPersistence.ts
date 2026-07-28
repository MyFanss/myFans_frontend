import { useEffect, useState, useCallback, useRef } from 'react';
import { OnboardingDraft, OnboardingFormData } from '@/types/onboarding';
import {
  getLocalDraft,
  saveLocalDraft,
  clearLocalDraft,
  mergeDrafts,
  createDraft,
  updateDraftStep,
} from '@/lib/onboarding/persistence';
import { getOnboardingDraft, putOnboardingDraft } from '@/lib/api/onboarding';

interface UseOnboardingPersistenceOptions {
  onDraftLoaded?: (draft: OnboardingDraft | null) => void;
  onSaveError?: (error: Error) => void;
}

export function useOnboardingPersistence(options: UseOnboardingPersistenceOptions = {}) {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Load draft on mount (merge server + local)
  useEffect(() => {
    async function loadDraft() {
      try {
        setIsLoading(true);
        setError(null);

        const serverDraft = await getOnboardingDraft().catch(() => null);
        const localDraft = getLocalDraft();
        const mergedDraft = mergeDrafts(serverDraft, localDraft);

        setDraft(mergedDraft);
        if (mergedDraft) {
          saveLocalDraft(mergedDraft);
        }
        options.onDraftLoaded?.(mergedDraft);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load draft');
        setError(error);
        options.onSaveError?.(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDraft();
  }, [options]);

  // Save draft to server with debounce
  const saveDraft = useCallback(
    async (updatedDraft: OnboardingDraft) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Save to localStorage immediately
      saveLocalDraft(updatedDraft);
      setDraft(updatedDraft);

      // Debounce server save by 500ms
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          setError(null);

          abortControllerRef.current = new AbortController();
          await putOnboardingDraft(updatedDraft.step, updatedDraft.data);

          setIsSaving(false);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to save draft');
          setError(error);
          setIsSaving(false);
          options.onSaveError?.(error);
        }
      }, 500);
    },
    [options]
  );

  // Save specific step
  const saveDraftStep = useCallback(
    async (step: number, stepData: any) => {
      if (!draft) {
        const newDraft = createDraft(step, { [getStepKey(step)]: stepData });
        await saveDraft(newDraft);
        return;
      }

      const updatedDraft = updateDraftStep(draft, step, stepData);
      await saveDraft(updatedDraft);
    },
    [draft, saveDraft]
  );

  // Clear draft
  const clearDraft = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearLocalDraft();
    setDraft(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    draft,
    isLoading,
    isSaving,
    error,
    saveDraft,
    saveDraftStep,
    clearDraft,
  };
}

function getStepKey(step: number): string {
  const keys = ['', 'identity', 'profile', 'monetization', 'content'];
  return keys[step] || '';
}
