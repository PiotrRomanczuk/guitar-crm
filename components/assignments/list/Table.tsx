'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Assignment } from '@/components/assignments/hooks';
import {
  AssignmentCard,
  AssignmentSectionHeader,
} from '@/components/assignments/shared';
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { isThisWeek, isPast, startOfToday } from 'date-fns';

interface TableProps {
  assignments: Assignment[];
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status display text
 */
function getStatusText(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get badge variant based on status
 */
function getStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'completed' as const;
    case 'in_progress':
      return 'in-progress' as const;
    case 'overdue':
      return 'late' as const;
    case 'cancelled':
      return 'cancelled' as const;
    default:
      return 'not-started' as const;
  }
}

/**
 * Group assignments by section (This Week, Later, Completed)
 */
function groupAssignments(assignments: Assignment[]) {
  const today = startOfToday();
  const thisWeek: Assignment[] = [];
  const later: Assignment[] = [];
  const overdue: Assignment[] = [];
  const completed: Assignment[] = [];

  assignments.forEach((assignment) => {
    if (assignment.status === 'completed') {
      completed.push(assignment);
      return;
    }

    if (assignment.status === 'overdue') {
      overdue.push(assignment);
      return;
    }

    if (!assignment.due_date) {
      later.push(assignment);
      return;
    }

    const dueDate = new Date(assignment.due_date);

    if (isPast(dueDate) && dueDate < today) {
      overdue.push(assignment);
    } else if (isThisWeek(dueDate)) {
      thisWeek.push(assignment);
    } else {
      later.push(assignment);
    }
  });

  return { thisWeek, later, overdue, completed };
}

/**
 * Assignment list with card view for mobile and table view for desktop
 */
export function Table({ assignments }: TableProps) {
  const router = useRouter();
  const grouped = useMemo(() => groupAssignments(assignments), [assignments]);

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/assignments/${id}`);
  };

  return (
    <>
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-2">
        {/* Overdue Section */}
        {grouped.overdue.length > 0 && (
          <>
            <AssignmentSectionHeader title="Overdue" count={grouped.overdue.length} />
            {grouped.overdue.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                id={assignment.id}
                title={assignment.title}
                description={assignment.description || undefined}
                studentName={
                  assignment.student_profile?.full_name ||
                  assignment.student_profile?.email ||
                  'Unknown'
                }
                dueDate={assignment.due_date}
                status="overdue"
                progress={15}
              />
            ))}
          </>
        )}

        {/* This Week Section */}
        {grouped.thisWeek.length > 0 && (
          <>
            <AssignmentSectionHeader title="This Week" count={grouped.thisWeek.length} />
            {grouped.thisWeek.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                id={assignment.id}
                title={assignment.title}
                description={assignment.description || undefined}
                studentName={
                  assignment.student_profile?.full_name ||
                  assignment.student_profile?.email ||
                  'Unknown'
                }
                dueDate={assignment.due_date}
                status={assignment.status}
                progress={assignment.status === 'in_progress' ? 40 : 0}
              />
            ))}
          </>
        )}

        {/* Later Section */}
        {grouped.later.length > 0 && (
          <>
            <AssignmentSectionHeader title="Later" />
            {grouped.later.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                id={assignment.id}
                title={assignment.title}
                description={assignment.description || undefined}
                studentName={
                  assignment.student_profile?.full_name ||
                  assignment.student_profile?.email ||
                  'Unknown'
                }
                dueDate={assignment.due_date}
                status={assignment.status}
                progress={assignment.status === 'in_progress' ? 40 : 0}
              />
            ))}
          </>
        )}

        {/* Completed Section */}
        {grouped.completed.length > 0 && (
          <>
            <AssignmentSectionHeader title="Completed" />
            {grouped.completed.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                id={assignment.id}
                title={assignment.title}
                description={assignment.description || undefined}
                studentName={
                  assignment.student_profile?.full_name ||
                  assignment.student_profile?.email ||
                  'Unknown'
                }
                dueDate={assignment.due_date}
                status="completed"
                progress={100}
              />
            ))}
          </>
        )}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
        <UiTable>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Student</TableHead>
              <TableHead className="hidden lg:table-cell">Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow
                key={assignment.id}
                onClick={() => handleRowClick(assignment.id)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{assignment.title}</span>
                    {assignment.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {assignment.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {assignment.student_profile?.full_name ||
                    assignment.student_profile?.email ||
                    'Unknown'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatDate(assignment.due_date)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(assignment.status)}>
                    {getStatusText(assignment.status)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UiTable>
      </div>
    </>
  );
}
