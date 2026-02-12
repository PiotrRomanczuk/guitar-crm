'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { AssignmentProgress } from './AssignmentProgress';
import { AssignmentStatusBadge, type AssignmentStatus } from './AssignmentStatusBadge';
import { format, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface AssignmentCardProps {
  id: string;
  title: string;
  description?: string;
  studentName: string;
  dueDate: string | null;
  status: AssignmentStatus;
  progress?: number;
  className?: string;
}

/**
 * Assignment card component for the assignment list
 * Displays assignment info with progress bar and status badge
 */
function AssignmentCard({
  id,
  title,
  description,
  studentName,
  dueDate,
  status,
  progress = 0,
  className,
}: AssignmentCardProps) {
  const isLate = status === 'overdue';
  const isCompleted = status === 'completed';

  // Format due date with relative info
  const formatDueDate = () => {
    if (!dueDate) return 'No due date';

    const date = new Date(dueDate);
    const formattedDate = format(date, 'MMM d');

    if (isCompleted) {
      return `Done ${formattedDate}`;
    }

    if (isLate || isPast(date)) {
      return `Overdue ${formattedDate}`;
    }

    if (isToday(date)) {
      return 'Due Today';
    }

    if (isTomorrow(date)) {
      return 'Due Tomorrow';
    }

    return `Due ${formattedDate}`;
  };

  // Determine if due date should be highlighted
  const isDueSoon = () => {
    if (!dueDate || isCompleted || isLate) return false;
    const date = new Date(dueDate);
    return isThisWeek(date) || isToday(date) || isTomorrow(date);
  };

  return (
    <Link href={`/dashboard/assignments/${id}`} className="block">
      <article
        className={cn(
          'group relative bg-card rounded-xl p-4 border shadow-sm',
          'active:scale-[0.99] transition-transform duration-100',
          'hover:border-primary/30 hover:shadow-md',
          isLate && 'border-destructive/30',
          isCompleted && 'opacity-75 hover:opacity-100',
          className
        )}
      >
        {/* Late indicator strip */}
        {isLate && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-xl" />
        )}

        {/* Header: Title & Status */}
        <div className={cn('flex justify-between items-start mb-3', isLate && 'pl-2')}>
          <div className="flex-1 mr-2">
            <h3
              className={cn(
                'text-base font-bold text-foreground leading-tight mb-1 truncate',
                isCompleted && 'line-through decoration-muted-foreground text-muted-foreground'
              )}
            >
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 min-w-0">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{studentName}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <div
                className={cn(
                  'flex items-center gap-1',
                  isLate && 'text-destructive font-medium',
                  isDueSoon() && !isLate && 'text-warning'
                )}
              >
                {isLate ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : isCompleted ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <Calendar className="h-3.5 w-3.5" />
                )}
                <span>{formatDueDate()}</span>
              </div>
            </div>
          </div>
          <AssignmentStatusBadge status={status} />
        </div>

        {/* Progress bar */}
        <div className={cn(isLate && 'pl-2')}>
          <AssignmentProgress progress={progress} status={status} />
        </div>
      </article>
    </Link>
  );
}

export { AssignmentCard, type AssignmentCardProps };
