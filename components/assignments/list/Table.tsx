'use client';

import { useRouter } from 'next/navigation';
import StatusBadge, { getStatusVariant } from '@/components/shared/StatusBadge';
import type { Assignment } from '@/components/assignments/hooks';
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
 * Assignment list table with clickable rows
 */
export function Table({ assignments }: TableProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/assignments/${id}`);
  };

  return (
    <>
      {/* Mobile View (Cards) */}
      <div className="md:hidden space-y-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            onClick={() => handleRowClick(assignment.id)}
            className="bg-card rounded-xl border shadow-sm p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate text-base">{assignment.title}</h3>
                {assignment.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {assignment.description}
                  </p>
                )}
              </div>
              <StatusBadge variant={getStatusVariant(assignment.status, 'assignment')} className="flex-shrink-0">
                {getStatusText(assignment.status)}
              </StatusBadge>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-border">
              <span className="truncate max-w-[50%]">
                {assignment.student_profile?.full_name ||
                  assignment.student_profile?.email ||
                  'Unknown'}
              </span>
              <span>Due: {formatDate(assignment.due_date)}</span>
            </div>
          </div>
        ))}
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
                  <StatusBadge variant={getStatusVariant(assignment.status, 'assignment')}>
                    {getStatusText(assignment.status)}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UiTable>
      </div>
    </>
  );
}
