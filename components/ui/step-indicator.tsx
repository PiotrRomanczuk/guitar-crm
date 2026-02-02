'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * Progress step bar component for onboarding and multi-step flows
 * Shows "Step X of Y" with optional percentage and animated progress bar
 */
function StepIndicator({
  currentStep,
  totalSteps,
  label,
  showPercentage = true,
  className,
}: StepIndicatorProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex justify-between items-end">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-primary text-xs font-medium">{label}</span>
          )}
          {showPercentage && (
            <span className="text-primary text-xs font-bold">{percentage}%</span>
          )}
        </div>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export { StepIndicator };
