import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Empty state for assignment list
 * Uses standardized EmptyState component
 */
export function Empty() {
  return (
    <EmptyState
      icon={ClipboardList}
      title="No assignments yet"
      message="Assignments will appear here once they are created. Teachers can create new assignments for their students."
    />
  );
}
