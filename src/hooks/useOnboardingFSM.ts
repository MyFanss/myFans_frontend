import { useReducer, useCallback } from 'react';
import {
  OnboardingFSMContext,
  OnboardingFSMEvent,
} from '@/types/onboarding';
import {
  onboardingFSMReducer,
  createInitialContext,
} from '@/lib/onboarding/fsm';

export function useOnboardingFSM() {
  const [context, dispatch] = useReducer(onboardingFSMReducer, createInitialContext());

  const handleEdit = useCallback(() => {
    dispatch({ type: 'EDIT' });
  }, []);

  const handleValidate = useCallback(() => {
    dispatch({ type: 'VALIDATE' });
  }, []);

  const handleSave = useCallback(() => {
    dispatch({ type: 'SAVE' });
  }, []);

  const handleAdvance = useCallback(() => {
    dispatch({ type: 'ADVANCE' });
  }, []);

  const handleError = useCallback((error: string) => {
    dispatch({ type: 'ERROR', error });
  }, []);

  const handleUnblock = useCallback(() => {
    dispatch({ type: 'UNBLOCK' });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const handleComplete = useCallback(() => {
    dispatch({ type: 'COMPLETE' });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    // This is a direct state update, not an event
    // We'll handle this through a custom dispatch pattern
    dispatch({ type: 'EDIT' } as any);
  }, []);

  return {
    context,
    dispatch,
    actions: {
      edit: handleEdit,
      validate: handleValidate,
      save: handleSave,
      advance: handleAdvance,
      error: handleError,
      unblock: handleUnblock,
      reset: handleReset,
      complete: handleComplete,
    },
  };
}
