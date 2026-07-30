'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { IdentityStep } from '@/components/onboarding/IdentityStep';
import { ProfileStep } from '@/components/onboarding/ProfileStep';
import { MonetizationStep } from '@/components/onboarding/MonetizationStep';
import { ContentReadinessStep } from '@/components/onboarding/ContentReadinessStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';
import { useOnboardingPersistence } from '@/hooks/useOnboardingPersistence';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { completeOnboarding } from '@/lib/api/onboarding';
import { numberToStep } from '@/lib/onboarding/fsm';
import { OnboardingFormData } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';

interface OnboardingPageProps {
  params: {
    step: string;
  };
}

export default function OnboardingStepPage({ params }: OnboardingPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { currentStep, nextStep, prevStep, goToStep } = useOnboardingStep();
  const { draft, isLoading: draftLoading, isSaving, saveDraftStep, clearDraft } = useOnboardingPersistence();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate step parameter
  useEffect(() => {
    const stepMap: { [key: string]: number } = {
      identity: 1,
      profile: 2,
      monetization: 3,
      content: 4,
      review: 5,
    };

    const stepNum = stepMap[params.step];
    if (!stepNum) {
      router.push('/onboarding/identity');
    }
  }, [params.step, router]);

  // Handle step submission
  const handleStepSubmit = useCallback(
    async (stepData: any) => {
      try {
        setIsSubmitting(true);
        setError(null);

        // Save step to draft
        await saveDraftStep(currentStep, stepData);

        // Show success toast
        toast({
          title: 'Saved',
          description: 'Your progress has been saved.',
        });

        // If not on last step, move to next
        if (currentStep < 5) {
          setTimeout(() => {
            nextStep();
          }, 500);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save progress';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentStep, nextStep, saveDraftStep, toast]
  );

  // Handle final submission
  const handleComplete = useCallback(async () => {
    if (!draft) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const formData: OnboardingFormData = {
        identity: draft.data.identity || {},
        profile: draft.data.profile || {},
        monetization: draft.data.monetization || {},
        content: draft.data.content || {},
      };

      // Create idempotency key
      const idempotencyKey = `onboarding-${draft.data.identity?.handle}-${Date.now()}`;

      await completeOnboarding(formData, idempotencyKey);

      // Clear draft
      clearDraft();

      // Show success
      toast({
        title: 'Profile Launched!',
        description: 'Your creator profile is now live.',
      });

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, clearDraft, router, toast]);

  if (draftLoading) {
    return (
      <OnboardingLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      onNext={() => {
        if (currentStep === 5) {
          handleComplete();
        } else {
          nextStep();
        }
      }}
      onPrev={prevStep}
      nextDisabled={isSubmitting || isSaving}
      prevDisabled={currentStep === 1 || isSubmitting}
    >
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
        </div>
      )}

      {currentStep === 1 && (
        <IdentityStep
          defaultValues={draft?.data.identity}
          onSubmit={handleStepSubmit}
          isLoading={isSubmitting || isSaving}
        />
      )}

      {currentStep === 2 && (
        <ProfileStep
          defaultValues={draft?.data.profile}
          onSubmit={handleStepSubmit}
          isLoading={isSubmitting || isSaving}
        />
      )}

      {currentStep === 3 && (
        <MonetizationStep
          defaultValues={draft?.data.monetization}
          onSubmit={handleStepSubmit}
          isLoading={isSubmitting || isSaving}
        />
      )}

      {currentStep === 4 && (
        <ContentReadinessStep
          defaultValues={draft?.data.content}
          onSubmit={handleStepSubmit}
          isLoading={isSubmitting || isSaving}
        />
      )}

      {currentStep === 5 && (
        <ReviewStep
          data={draft?.data || {}}
          onSubmit={handleComplete}
          onEditStep={goToStep}
          isLoading={isSubmitting}
        />
      )}
    </OnboardingLayout>
  );
}
