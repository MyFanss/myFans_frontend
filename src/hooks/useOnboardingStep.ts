import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { stepToNumber, numberToStep } from '@/lib/onboarding/fsm';

interface UseOnboardingStepOptions {
  totalSteps?: number;
}

export function useOnboardingStep(options: UseOnboardingStepOptions = {}) {
  const { totalSteps = 5 } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  // Parse current step from URL
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNum = parseInt(stepParam, 10);
      if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= totalSteps) {
        setCurrentStep(stepNum);
      }
    } else {
      // Try to extract from pathname
      const pathParts = pathname.split('/');
      const stepPart = pathParts[pathParts.length - 1];
      const stepNum = stepToNumber(stepPart);
      setCurrentStep(stepNum);
    }
  }, [pathname, searchParams, totalSteps]);

  // Navigate to step
  const goToStep = useCallback(
    (step: number) => {
      if (step < 1 || step > totalSteps) {
        console.warn(`Invalid step: ${step}`);
        return;
      }

      setCurrentStep(step);
      const stepName = numberToStep(step);
      router.push(`/onboarding/${stepName}`);
    },
    [router, totalSteps]
  );

  // Navigate to next step
  const nextStep = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Check if can go to next
  const canGoNext = currentStep < totalSteps;

  // Check if can go to previous
  const canGoPrev = currentStep > 1;

  // Calculate progress
  const progress = Math.round((currentStep / totalSteps) * 100);

  return {
    currentStep,
    totalSteps,
    progress,
    canGoNext,
    canGoPrev,
    goToStep,
    nextStep,
    prevStep,
  };
}
