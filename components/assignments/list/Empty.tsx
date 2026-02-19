import { ClipboardList } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

/**
 * Empty state for assignment list
 */
export function Empty() {
  return (
    <EmptyState
      variant="card"
      icon={ClipboardList}
      title="No assignments yet"
      description="Assignments will appear here once they are created. Teachers can create new assignments for their students."
      action={{ label: "Create Assignment", href: "/dashboard/assignments/new" }}
    />
  );
}
