// Onboarding step definitions
export type OnboardingStep = 'identity' | 'profile' | 'monetization' | 'content' | 'review';

// Step data types
export interface IdentityData {
  displayName: string;
  handle: string;
  avatar?: string;
}

export interface ProfileData {
  bio: string;
  categories: string[];
  socialLinks: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface MonetizationData {
  payoutMethod: 'bank_transfer' | 'paypal' | '';
  kycCompleted: boolean;
  termsAccepted: boolean;
}

export interface ContentData {
  hasDraft: boolean;
  draftTitle?: string;
  skippedContent: boolean;
}

// Complete onboarding form data
export interface OnboardingFormData {
  identity: IdentityData;
  profile: ProfileData;
  monetization: MonetizationData;
  content: ContentData;
}

// Draft stored locally and on server
export interface OnboardingDraft {
  step: number;
  data: Partial<OnboardingFormData>;
  updatedAt: number;
  version: string;
}

// Server response for draft get/put
export interface OnboardingDraftResponse {
  step: number;
  data: Partial<OnboardingFormData>;
  updatedAt: number;
  version: string;
}

// Complete onboarding response
export interface OnboardingCompleteResponse {
  id: string;
  status: 'completed';
  createdAt: string;
}

// FSM states
export type OnboardingFSMState = 'idle' | 'editing' | 'validating' | 'saving' | 'advancing' | 'completed' | 'error' | 'blocked';

export type OnboardingFSMEvent =
  | { type: 'EDIT' }
  | { type: 'VALIDATE' }
  | { type: 'SAVE' }
  | { type: 'ADVANCE' }
  | { type: 'RESET' }
  | { type: 'ERROR'; error: string }
  | { type: 'UNBLOCK' }
  | { type: 'COMPLETE' };

export interface OnboardingFSMContext {
  currentStep: number;
  state: OnboardingFSMState;
  error?: string;
  isDirty: boolean;
  isSaving: boolean;
  isValidating: boolean;
}

// Handle validation result
export interface HandleValidationResult {
  available: boolean;
  error?: string;
}

// Async validation state
export interface AsyncValidationState {
  isChecking: boolean;
  error?: string;
  value?: string;
}

// Step-specific error mapping
export interface StepErrors {
  [key: string]: string;
}

// Onboarding progress
export interface OnboardingProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  percentComplete: number;
}

// Observability events
export interface OnboardingEvent {
  type: 'step_view' | 'step_complete' | 'step_error' | 'validation_error' | 'save_error' | 'abandon' | 'complete';
  step?: OnboardingStep;
  timestamp: number;
  duration?: number;
  error?: string;
}
