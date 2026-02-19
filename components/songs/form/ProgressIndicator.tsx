import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  className?: string;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-colors',
              step <= currentStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step Text */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
          {stepLabels && stepLabels[currentStep - 1] && (
            <span className="font-medium text-foreground ml-1">
              — {stepLabels[currentStep - 1]}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round((currentStep / totalSteps) * 100)}%
        </p>
      </div>
    </div>
  );
}
