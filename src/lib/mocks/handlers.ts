import { http, HttpResponse } from 'msw';
import { OnboardingDraft, OnboardingFormData } from '@/types/onboarding';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Storage for mocking server-side state
const draftStore = new Map<string, OnboardingDraft>();
const completedUsers = new Set<string>();
const takenHandles = new Set<string>(['admin', 'support', 'help']);

export const onboardingHandlers = [
  // GET /api/onboarding/draft
  http.get(`${API_URL}/api/onboarding/draft`, () => {
    const draft = draftStore.get('current-user');
    if (!draft) {
      return HttpResponse.json(null, { status: 404 });
    }
    return HttpResponse.json(draft);
  }),

  // PUT /api/onboarding/draft/:step
  http.put(`${API_URL}/api/onboarding/draft/:step`, async ({ request, params }) => {
    try {
      const body = await request.json() as { data: any };
      const step = parseInt(params.step as string, 10);

      // Get existing draft or create new
      let draft = draftStore.get('current-user');
      if (!draft) {
        draft = {
          step,
          data: {},
          updatedAt: Date.now(),
          version: '1.0',
        };
      }

      // Update draft
      const stepKey = getStepKey(step);
      draft = {
        ...draft,
        step: Math.max(draft.step, step),
        data: {
          ...draft.data,
          [stepKey]: body.data,
        },
        updatedAt: Date.now(),
      };

      draftStore.set('current-user', draft);
      return HttpResponse.json(draft);
    } catch (err) {
      return HttpResponse.json(
        { error: 'Failed to save draft' },
        { status: 400 }
      );
    }
  }),

  // POST /api/onboarding/complete
  http.post(`${API_URL}/api/onboarding/complete`, async ({ request }) => {
    try {
      const idempotencyKey = request.headers.get('Idempotency-Key');
      const body = await request.json() as OnboardingFormData;

      // Check if already completed
      if (completedUsers.has('current-user')) {
        return HttpResponse.json(
          { error: 'Already completed' },
          { status: 409 }
        );
      }

      // Validate required fields
      if (
        !body.identity?.displayName ||
        !body.identity?.handle ||
        !body.profile?.categories?.length ||
        !body.monetization?.payoutMethod ||
        !body.monetization?.termsAccepted
      ) {
        return HttpResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Mark as completed
      completedUsers.add('current-user');
      draftStore.delete('current-user');

      return HttpResponse.json({
        id: 'creator-' + Date.now(),
        status: 'completed',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      return HttpResponse.json(
        { error: 'Failed to complete onboarding' },
        { status: 500 }
      );
    }
  }),

  // GET /api/onboarding/check-handle
  http.get(`${API_URL}/api/onboarding/check-handle`, ({ request }) => {
    const url = new URL(request.url);
    const handle = url.searchParams.get('handle');

    if (!handle) {
      return HttpResponse.json(
        { error: 'Handle parameter required' },
        { status: 400 }
      );
    }

    // Simulate network delay for realism
    const isAvailable = !takenHandles.has(handle.toLowerCase());

    return HttpResponse.json({
      available: isAvailable,
      error: isAvailable ? undefined : 'Handle already taken',
    });
  }),

  // GET /api/onboarding/categories
  http.get(`${API_URL}/api/onboarding/categories`, () => {
    return HttpResponse.json([
      { id: '1', name: 'Music' },
      { id: '2', name: 'Gaming' },
      { id: '3', name: 'Art & Design' },
      { id: '4', name: 'Education' },
      { id: '5', name: 'Fitness' },
      { id: '6', name: 'Lifestyle' },
      { id: '7', name: 'Comedy' },
      { id: '8', name: 'Technology' },
      { id: '9', name: 'Fashion' },
      { id: '10', name: 'Other' },
    ]);
  }),
];

// Helper function to get step key
function getStepKey(step: number): string {
  const keys = ['', 'identity', 'profile', 'monetization', 'content'];
  return keys[step] || '';
}

// Test helpers
export const onboardingMockHelpers = {
  // Clear all drafts (for test cleanup)
  clearDrafts: () => {
    draftStore.clear();
    completedUsers.clear();
  },

  // Set a draft
  setDraft: (draft: OnboardingDraft) => {
    draftStore.set('current-user', draft);
  },

  // Mark user as completed
  markCompleted: () => {
    completedUsers.add('current-user');
  },

  // Add a taken handle
  addTakenHandle: (handle: string) => {
    takenHandles.add(handle.toLowerCase());
  },

  // Check if user is completed
  isCompleted: () => completedUsers.has('current-user'),

  // Get current draft
  getDraft: () => draftStore.get('current-user'),
};
