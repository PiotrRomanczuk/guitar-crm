'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Check, X, AlertCircle } from 'lucide-react';

type LessonStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface StatusBadgeProps {
  status: LessonStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  LessonStatus,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    className: 'bg-warning/20 text-warning border-warning/20',
    icon: Calendar,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-primary/20 text-primary border-primary/20',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-success/20 text-success border-success/20',
    icon: Check,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-destructive/20 text-destructive border-destructive/20',
    icon: X,
  },
};

/**
 * Status badge for lessons
 * Displays lesson status with appropriate color and optional icon
 */
function StatusBadge({ status, className, showIcon = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
        'text-[10px] font-bold uppercase tracking-wider',
        'border',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

export { StatusBadge, type LessonStatus };
