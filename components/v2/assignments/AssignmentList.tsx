'use client';

import { lazy, Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayoutMode } from '@/hooks/use-is-widescreen';
import { useAssignmentList } from '@/components/assignments/hooks/useAssignmentList';
import { staggerContainer, listItem } from '@/lib/animations/variants';
import type { Assignment } from '@/components/assignments/hooks/useAssignment';
import { AssignmentListSkeleton } from './AssignmentList.Skeleton';
import { AssignmentCardMobile } from './AssignmentCard.Mobile';

const DesktopView = lazy(() => import('./AssignmentList.Desktop'));

type StatusFilter = 'all' | 'not_started' | 'in_progress' | 'overdue' | 'completed';

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'completed', label: 'Completed' },
];

interface AssignmentListProps {
  canCreate?: boolean;
  studentId?: string;
}

export function AssignmentList({ canCreate = false, studentId }: AssignmentListProps) {
  const mode = useLayoutMode();
  const { assignments, isLoading } = useAssignmentList(
    studentId ? { student_id: studentId } : undefined
  );

  if (mode !== 'mobile') {
    return (
      <Suspense fallback={<MobileView assignments={assignments} isLoading={isLoading} canCreate={canCreate} />}>
        <DesktopView assignments={assignments} isLoading={isLoading} canCreate={canCreate} />
      </Suspense>
    );
  }

  return <MobileView assignments={assignments} isLoading={isLoading} canCreate={canCreate} />;
}

interface MobileViewProps {
  assignments: Assignment[];
  isLoading: boolean;
  canCreate: boolean;
}

function MobileView({ assignments, isLoading, canCreate }: MobileViewProps) {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return assignments;
    return assignments.filter((a) => a.status === filter);
  }, [assignments, filter]);

  if (isLoading) return <AssignmentListSkeleton />;

  return (
    <div className="px-4 space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
              'shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors',
              'border border-border min-h-[44px]',
              filter === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState canCreate={canCreate} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
          {filtered.map((assignment) => (
            <motion.div key={assignment.id} variants={listItem}>
              <AssignmentCardMobile assignment={assignment} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {canCreate && (
        <Link
          href="/dashboard/assignments/new"
          className={cn(
            'fixed right-4 z-40 rounded-full shadow-lg',
            'bg-primary text-primary-foreground',
            'w-14 h-14 flex items-center justify-center',
            'bottom-[calc(4rem+env(safe-area-inset-bottom)+1rem)]',
            'active:scale-95 transition-transform'
          )}
          aria-label="Create assignment"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <ClipboardList className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">No assignments yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {canCreate
          ? 'Create your first assignment to start tracking student tasks.'
          : 'Your teacher hasn\'t assigned anything yet.'}
      </p>
      {canCreate && (
        <Link
          href="/dashboard/assignments/new"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </Link>
      )}
    </div>
  );
}

export default AssignmentList;
