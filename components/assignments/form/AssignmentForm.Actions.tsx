import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AssignmentFormActionsProps {
  mode: 'create' | 'edit';
  loading: boolean;
}

export function AssignmentFormActions({ mode, loading }: AssignmentFormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      <Button type="submit" disabled={loading} data-testid="submit-button">
        {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
      </Button>
      <Button variant="outline" asChild>
        <Link href="/dashboard/assignments">Cancel</Link>
      </Button>
    </div>
  );
}
