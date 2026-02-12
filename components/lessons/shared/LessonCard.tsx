'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge, type LessonStatus } from './StatusBadge';
import { Calendar, Clock, ChevronRight, CalendarX } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface LessonCardProps {
  id: string;
  title?: string;
  date: string;
  time?: string;
  status: LessonStatus;
  studentName: string;
  studentAvatar?: string;
  notes?: string;
  cancelReason?: string;
  className?: string;
}

/**
 * Lesson card component for the lesson history list
 * Displays lesson info with student avatar, status badge, and notes preview
 */
function LessonCard({
  id,
  title,
  date,
  time,
  status,
  studentName,
  studentAvatar,
  notes,
  cancelReason,
  className,
}: LessonCardProps) {
  const isCancelled = status === 'CANCELLED';

  // Format date nicely
  const formattedDate = format(new Date(date), 'MMM d');
  const formattedTime = time || '';

  // Get initials for avatar fallback
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Choose icon based on status
  const DateIcon = isCancelled ? CalendarX : status === 'SCHEDULED' ? Clock : Calendar;

  return (
    <Link href={`/dashboard/lessons/${id}`} className="block">
      <article
        className={cn(
          'group relative bg-card rounded-xl p-4 shadow-sm border border-border',
          'active:scale-[0.99] transition-transform duration-100',
          'hover:border-primary/30 hover:shadow-md',
          isCancelled && 'opacity-75',
          className
        )}
      >
        {/* Header: Date & Status */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <DateIcon className="h-4 w-4" />
            <span>
              {formattedDate}
              {formattedTime && `, ${formattedTime}`}
            </span>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border border-border">
            {studentAvatar ? (
              <AvatarImage src={studentAvatar} alt={studentName} />
            ) : null}
            <AvatarFallback className="text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4
              className={cn(
                'text-base font-bold text-foreground leading-tight truncate',
                isCancelled && 'line-through decoration-muted-foreground'
              )}
            >
              {studentName}
            </h4>
            {title && (
              <p className="text-sm text-muted-foreground truncate">{title}</p>
            )}
          </div>
        </div>

        {/* Notes or Cancel Reason */}
        {(notes || cancelReason) && (
          <div
            className={cn(
              'bg-muted/50 rounded-lg p-2.5',
              !notes && cancelReason && 'border border-dashed border-border'
            )}
          >
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {isCancelled && cancelReason ? (
                <>
                  <span className="font-medium text-foreground mr-1">Reason:</span>
                  {cancelReason}
                </>
              ) : notes ? (
                <>
                  <span className="font-medium text-foreground mr-1">Notes:</span>
                  {notes}
                </>
              ) : (
                <span className="italic">
                  No notes added yet. Tap to add pre-lesson notes.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Hover Chevron */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </article>
    </Link>
  );
}

/**
 * Section header for month grouping in lesson history
 */
interface LessonMonthHeaderProps {
  month: string;
  className?: string;
}

function LessonMonthHeader({ month, className }: LessonMonthHeaderProps) {
  return (
    <h3
      className={cn(
        'text-sm font-semibold text-muted-foreground mb-3 px-1',
        'sticky top-0 bg-background py-2 z-10',
        className
      )}
    >
      {month}
    </h3>
  );
}

export { LessonCard, LessonMonthHeader, type LessonCardProps };
