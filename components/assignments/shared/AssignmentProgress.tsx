'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface AssignmentProgressProps {
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  className?: string;
}

/**
 * Progress bar for assignments
 * Shows percentage with color based on status
 */
function AssignmentProgress({ progress, status, className }: AssignmentProgressProps) {
  const isCompleted = status === 'completed';
  const isLate = status === 'overdue';
  const isNotStarted = status === 'not_started';

  // Determine bar color based on status
  const getBarColor = () => {
    if (isCompleted) return 'bg-primary';
    if (isLate) return 'bg-destructive';
    if (isNotStarted) return 'bg-muted-foreground';
    return 'bg-primary';
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', getBarColor())}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {isCompleted ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <span
          className={cn(
            'text-xs font-medium w-8 text-right',
            isLate ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {progress}%
        </span>
      )}
    </div>
  );
}

export { AssignmentProgress };
