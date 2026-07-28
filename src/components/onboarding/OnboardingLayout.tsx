'use client';

import { ReactNode } from 'react';
import { useOnboardingStep } from '@/hooks/useOnboardingStep';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  canSkip?: boolean;
  onSkip?: () => void;
}

const STEP_NAMES = {
  1: 'Identity',
  2: 'Profile',
  3: 'Monetization',
  4: 'Content',
  5: 'Review',
};

export function OnboardingLayout({
  children,
  onNext,
  onPrev,
  nextDisabled = false,
  prevDisabled = false,
  canSkip = false,
  onSkip,
}: OnboardingLayoutProps) {
  const { currentStep, totalSteps, progress, canGoNext, canGoPrev } = useOnboardingStep();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">
                  {STEP_NAMES[currentStep as keyof typeof STEP_NAMES] || 'Step'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
              <div className="text-sm font-medium">{progress}%</div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Step indicators */}
            <div className="flex gap-2" role="tablist" aria-label="Onboarding steps">
              {Array.from({ length: totalSteps }).map((_, i) => {
                const step = i + 1;
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;

                return (
                  <div
                    key={step}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${STEP_NAMES[step as keyof typeof STEP_NAMES]} step`}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      isCompleted
                        ? 'bg-green-500'
                        : isActive
                          ? 'bg-blue-500'
                          : 'bg-muted'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <main role="main" className="mb-8">
          {children}
        </main>
      </div>

      {/* Sticky Footer Actions */}
      <div className="sticky bottom-0 bg-background border-t">
        <div className="max-w-4xl mx-auto px-4 py-4 flex gap-3 justify-between">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={prevDisabled || !canGoPrev}
              aria-label="Go to previous step"
            >
              <ChevronLeft className="size-4 mr-1" />
              Back
            </Button>

            {canSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                aria-label="Skip this step"
              >
                Skip
              </Button>
            )}
          </div>

          <Button
            size="sm"
            onClick={onNext}
            disabled={nextDisabled || !canGoNext}
            aria-label="Go to next step"
          >
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
