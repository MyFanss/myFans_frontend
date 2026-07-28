import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export interface OnboardingStatus {
  isLoading: boolean;
  isOnboardingRequired: boolean;
  currentStep?: number;
  error?: Error;
}

export function useOnboardingStatus(): OnboardingStatus {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingRequired, setIsOnboardingRequired] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        setIsLoading(true);
        setError(undefined);

        // If user is not authenticated or is a subscriber, no onboarding needed
        if (!user) {
          setIsOnboardingRequired(false);
          return;
        }

        // Check if user is a creator (has role 'creator')
        if (user.role !== 'creator') {
          setIsOnboardingRequired(false);
          return;
        }

        // Check if profile is complete
        const isComplete =
          user.displayName &&
          user.handle &&
          user.bio &&
          user.categories?.length > 0;

        setIsOnboardingRequired(!isComplete);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to check onboarding status');
        setError(error);
        setIsOnboardingRequired(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading]);

  return {
    isLoading: authLoading || isLoading,
    isOnboardingRequired,
    error,
  };
}

// Hook to guard access to dashboard for incomplete creators
export function useOnboardingGuard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    // If not authenticated, let auth middleware handle it
    if (!user) {
      setIsReady(true);
      return;
    }

    // If not a creator, allow access
    if (user.role !== 'creator') {
      setIsReady(true);
      return;
    }

    // If creator but onboarding incomplete, redirect
    const isComplete =
      user.displayName &&
      user.handle &&
      user.bio &&
      user.categories?.length > 0;

    if (!isComplete) {
      router.push('/onboarding/identity');
    } else {
      setIsReady(true);
    }
  }, [user, authLoading, router]);

  return { isReady };
}
