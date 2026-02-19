'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  title: React.ReactNode;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

/**
 * Onboarding layout with mobile container, progress bar, and gradient background
 * Used for multi-step onboarding flows (Goals, Skill Level, etc.)
 */
function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  stepLabel,
  title,
  subtitle,
  showBackButton = true,
  onBack,
  className,
}: OnboardingLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center bg-background overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Mobile container */}
      <div
        className={cn(
          'relative w-full max-w-md min-h-screen flex flex-col',
          className
        )}
      >
        {/* Top Section */}
        <div className="flex flex-col px-6 pt-12 pb-2">
          {/* Back Button (optional) */}
          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="absolute top-4 left-4 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Progress Bar */}
          <StepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            label={stepLabel}
            className="mb-8"
          />

          {/* Header */}
          <div className="space-y-3">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary text-xs font-bold tracking-wide">
                AI PERSONALIZATION
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

interface OnboardingFooterProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  showBack?: boolean;
  showSkip?: boolean;
  nextDisabled?: boolean;
  loading?: boolean;
}

/**
 * Sticky footer with navigation buttons for onboarding flows
 */
function OnboardingFooter({
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Next',
  backLabel = 'Back',
  skipLabel = 'Skip',
  showBack = false,
  showSkip = false,
  nextDisabled = false,
  loading = false,
}: OnboardingFooterProps) {
  return (
    <div className="sticky bottom-0 px-6 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="flex flex-col items-center gap-4">
        {/* Button Row */}
        <div className={cn('flex gap-4 w-full', showBack ? 'flex-row' : 'flex-col')}>
          {showBack && (
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              className="flex-1 h-14 rounded-lg font-bold text-base"
            >
              {backLabel}
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || loading}
            className={cn(
              'h-14 rounded-lg font-bold text-base',
              'shadow-[0_0_15px_hsl(var(--primary)/0.4)]',
              showBack ? 'flex-1' : 'w-full'
            )}
          >
            {loading ? 'Loading...' : nextLabel}
          </Button>
        </div>

        {/* Skip Link */}
        {showSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export { OnboardingLayout, OnboardingFooter };
