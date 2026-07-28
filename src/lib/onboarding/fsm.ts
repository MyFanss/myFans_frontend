import {
  OnboardingFSMState,
  OnboardingFSMEvent,
  OnboardingFSMContext,
} from '@/types/onboarding';

// Initial state
export function createInitialContext(): OnboardingFSMContext {
  return {
    currentStep: 1,
    state: 'idle',
    isDirty: false,
    isSaving: false,
    isValidating: false,
  };
}

// Reducer function with exhaustive type checking
export function onboardingFSMReducer(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  const { state, currentStep } = context;

  switch (state) {
    case 'idle':
      return handleIdleState(context, event);

    case 'editing':
      return handleEditingState(context, event);

    case 'validating':
      return handleValidatingState(context, event);

    case 'saving':
      return handleSavingState(context, event);

    case 'advancing':
      return handleAdvancingState(context, event);

    case 'completed':
      return handleCompletedState(context, event);

    case 'error':
      return handleErrorState(context, event);

    case 'blocked':
      return handleBlockedState(context, event);

    default:
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
}

function handleIdleState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'EDIT':
      return { ...context, state: 'editing', isDirty: true };
    case 'VALIDATE':
      return { ...context, state: 'validating', isValidating: true };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

function handleEditingState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'VALIDATE':
      return { ...context, state: 'validating', isValidating: true };
    case 'SAVE':
      return { ...context, state: 'saving', isSaving: true };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

function handleValidatingState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'SAVE':
      return { ...context, state: 'saving', isSaving: true, isValidating: false };
    case 'ERROR':
      return {
        ...context,
        state: 'error',
        error: event.error,
        isValidating: false,
      };
    case 'ADVANCE':
      return {
        ...context,
        state: 'advancing',
        isValidating: false,
        isDirty: false,
      };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

function handleSavingState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'ADVANCE':
      return {
        ...context,
        state: 'advancing',
        isSaving: false,
        isDirty: false,
        currentStep: Math.min(context.currentStep + 1, 5),
      };
    case 'ERROR':
      return {
        ...context,
        state: 'error',
        error: event.error,
        isSaving: false,
      };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

function handleAdvancingState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'COMPLETE':
      return {
        ...context,
        state: 'completed',
        currentStep: 5,
      };
    case 'EDIT':
      return { ...context, state: 'editing', isDirty: true };
    case 'ERROR':
      return {
        ...context,
        state: 'error',
        error: event.error,
      };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

function handleCompletedState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  // Completed state is terminal
  return context;
}

function handleErrorState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'EDIT':
      return {
        ...context,
        state: 'editing',
        isDirty: true,
        error: undefined,
      };
    case 'UNBLOCK':
      return {
        ...context,
        state: 'editing',
        error: undefined,
      };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

function handleBlockedState(
  context: OnboardingFSMContext,
  event: OnboardingFSMEvent
): OnboardingFSMContext {
  switch (event.type) {
    case 'UNBLOCK':
      return {
        ...context,
        state: 'editing',
      };
    case 'RESET':
      return createInitialContext();
    default:
      return context;
  }
}

// Helper functions
export function canAdvance(state: OnboardingFSMState): boolean {
  return state === 'editing' || state === 'idle';
}

export function canSave(state: OnboardingFSMState): boolean {
  return state === 'editing' || state === 'validating';
}

export function isInProgress(state: OnboardingFSMState): boolean {
  return ['saving', 'validating', 'advancing'].includes(state);
}

export function stepToNumber(step: string): number {
  const stepMap: { [key: string]: number } = {
    identity: 1,
    profile: 2,
    monetization: 3,
    content: 4,
    review: 5,
  };
  return stepMap[step] || 1;
}

export function numberToStep(num: number): string {
  const stepMap: { [key: number]: string } = {
    1: 'identity',
    2: 'profile',
    3: 'monetization',
    4: 'content',
    5: 'review',
  };
  return stepMap[num] || 'identity';
}
