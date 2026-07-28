import { describe, it, expect } from 'vitest';
import {
  onboardingFSMReducer,
  createInitialContext,
  canAdvance,
  canSave,
  isInProgress,
} from '../fsm';
import { OnboardingFSMContext } from '@/types/onboarding';

describe('Onboarding FSM', () => {
  describe('State Transitions', () => {
    it('should initialize with idle state', () => {
      const context = createInitialContext();
      expect(context.state).toBe('idle');
      expect(context.currentStep).toBe(1);
      expect(context.isDirty).toBe(false);
    });

    it('should transition from idle to editing on EDIT', () => {
      const context = createInitialContext();
      const result = onboardingFSMReducer(context, { type: 'EDIT' });
      expect(result.state).toBe('editing');
      expect(result.isDirty).toBe(true);
    });

    it('should transition from editing to validating on VALIDATE', () => {
      const context = { ...createInitialContext(), state: 'editing' as const };
      const result = onboardingFSMReducer(context, { type: 'VALIDATE' });
      expect(result.state).toBe('validating');
      expect(result.isValidating).toBe(true);
    });

    it('should transition from validating to saving on SAVE', () => {
      const context = {
        ...createInitialContext(),
        state: 'validating' as const,
      };
      const result = onboardingFSMReducer(context, { type: 'SAVE' });
      expect(result.state).toBe('saving');
      expect(result.isSaving).toBe(true);
    });

    it('should transition from saving to advancing on ADVANCE', () => {
      const context = {
        ...createInitialContext(),
        state: 'saving' as const,
      };
      const result = onboardingFSMReducer(context, { type: 'ADVANCE' });
      expect(result.state).toBe('advancing');
      expect(result.isDirty).toBe(false);
    });

    it('should transition to error state on ERROR event', () => {
      const context = { ...createInitialContext(), state: 'validating' as const };
      const result = onboardingFSMReducer(context, {
        type: 'ERROR',
        error: 'Validation failed',
      });
      expect(result.state).toBe('error');
      expect(result.error).toBe('Validation failed');
    });

    it('should transition from error to editing on EDIT', () => {
      const context = {
        ...createInitialContext(),
        state: 'error' as const,
        error: 'Previous error',
      };
      const result = onboardingFSMReducer(context, { type: 'EDIT' });
      expect(result.state).toBe('editing');
      expect(result.error).toBeUndefined();
    });

    it('should reset state on RESET event', () => {
      const context = {
        ...createInitialContext(),
        state: 'error' as const,
        error: 'Some error',
        isDirty: true,
      };
      const result = onboardingFSMReducer(context, { type: 'RESET' });
      expect(result).toEqual(createInitialContext());
    });
  });

  describe('Completed State', () => {
    it('should remain in completed state', () => {
      const context = { ...createInitialContext(), state: 'completed' as const };
      const result = onboardingFSMReducer(context, { type: 'EDIT' });
      expect(result.state).toBe('completed');
    });
  });

  describe('Helper Functions', () => {
    it('should identify when advancing is possible', () => {
      expect(canAdvance('editing')).toBe(true);
      expect(canAdvance('idle')).toBe(true);
      expect(canAdvance('saving')).toBe(false);
      expect(canAdvance('validating')).toBe(false);
    });

    it('should identify when saving is possible', () => {
      expect(canSave('editing')).toBe(true);
      expect(canSave('validating')).toBe(true);
      expect(canSave('idle')).toBe(false);
      expect(canSave('saving')).toBe(false);
    });

    it('should identify when process is in progress', () => {
      expect(isInProgress('saving')).toBe(true);
      expect(isInProgress('validating')).toBe(true);
      expect(isInProgress('advancing')).toBe(true);
      expect(isInProgress('editing')).toBe(false);
      expect(isInProgress('idle')).toBe(false);
    });
  });

  describe('Dirty Tracking', () => {
    it('should set isDirty on edit', () => {
      const context = createInitialContext();
      const result = onboardingFSMReducer(context, { type: 'EDIT' });
      expect(result.isDirty).toBe(true);
    });

    it('should clear isDirty on successful advance', () => {
      const context = {
        ...createInitialContext(),
        state: 'saving' as const,
        isDirty: true,
      };
      const result = onboardingFSMReducer(context, { type: 'ADVANCE' });
      expect(result.isDirty).toBe(false);
    });
  });
});
