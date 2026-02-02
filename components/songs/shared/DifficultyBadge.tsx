'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type DifficultyLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  className?: string;
}

const difficultyConfig: Record<
  DifficultyLevel,
  {
    label: string;
    className: string;
  }
> = {
  novice: {
    label: 'Novice',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  beginner: {
    label: 'Beginner',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  expert: {
    label: 'Expert',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

/**
 * Difficulty badge for songs
 * Shows skill level with appropriate color coding
 * - Beginner: Green (primary)
 * - Intermediate: Yellow (warning)
 * - Advanced: Red (destructive)
 */
function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[level];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded',
        'text-[10px] font-bold uppercase tracking-wide',
        'border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export { DifficultyBadge, type DifficultyLevel };
