import { OnboardingDraft, OnboardingDraftResponse, OnboardingCompleteResponse, OnboardingFormData } from '@/types/onboarding';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Get onboarding draft
export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  try {
    const response = await fetch(`${API_URL}/api/onboarding/draft`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (response.status === 404) {
      // No draft exists yet
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch draft: ${response.statusText}`);
    }

    const data = (await response.json()) as OnboardingDraftResponse;
    return {
      step: data.step,
      data: data.data,
      updatedAt: data.updatedAt,
      version: data.version,
    };
  } catch (err) {
    console.error('Error fetching onboarding draft:', err);
    throw err;
  }
}

// Put (upsert) onboarding draft for a specific step
export async function putOnboardingDraft(
  step: number,
  data: Partial<OnboardingFormData>
): Promise<OnboardingDraft> {
  try {
    const response = await fetch(`${API_URL}/api/onboarding/draft/${step}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save draft: ${response.statusText}`);
    }

    const result = (await response.json()) as OnboardingDraftResponse;
    return {
      step: result.step,
      data: result.data,
      updatedAt: result.updatedAt,
      version: result.version,
    };
  } catch (err) {
    console.error('Error saving onboarding draft:', err);
    throw err;
  }
}

// Complete onboarding with idempotency key for safe retries
export async function completeOnboarding(
  data: OnboardingFormData,
  idempotencyKey: string
): Promise<OnboardingCompleteResponse> {
  try {
    const response = await fetch(`${API_URL}/api/onboarding/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Already completed, return success
        return {
          id: '',
          status: 'completed',
          createdAt: new Date().toISOString(),
        };
      }
      throw new Error(`Failed to complete onboarding: ${response.statusText}`);
    }

    return (await response.json()) as OnboardingCompleteResponse;
  } catch (err) {
    console.error('Error completing onboarding:', err);
    throw err;
  }
}

// Check if handle is available (async validation)
export async function checkHandleAvailability(
  handle: string,
  signal?: AbortSignal
): Promise<{ available: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${API_URL}/api/onboarding/check-handle?handle=${encodeURIComponent(handle)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check handle: ${response.statusText}`);
    }

    return (await response.json()) as { available: boolean; error?: string };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { available: false, error: 'Check cancelled' };
    }
    console.error('Error checking handle availability:', err);
    return { available: false, error: 'Failed to verify handle' };
  }
}

// Get list of available categories
export async function getCategories(): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await fetch(`${API_URL}/api/onboarding/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return (await response.json()) as Array<{ id: string; name: string }>;
  } catch (err) {
    console.error('Error fetching categories:', err);
    // Return mock categories as fallback
    return [
      { id: '1', name: 'Music' },
      { id: '2', name: 'Gaming' },
      { id: '3', name: 'Art & Design' },
      { id: '4', name: 'Education' },
      { id: '5', name: 'Fitness' },
      { id: '6', name: 'Lifestyle' },
      { id: '7', name: 'Comedy' },
      { id: '8', name: 'Other' },
    ];
  }
}
