'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface AssignmentSectionHeaderProps {
  title: string;
  count?: number;
  className?: string;
}

/**
 * Section header for grouping assignments
 * Shows title like "THIS WEEK" with optional count badge
 */
function AssignmentSectionHeader({ title, count, className }: AssignmentSectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pt-4 pb-2', className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-primary font-medium">{count} Due</span>
      )}
    </div>
  );
}

export { AssignmentSectionHeader };
