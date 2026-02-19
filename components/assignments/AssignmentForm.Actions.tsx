'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AssignmentFormActionsProps {
  mode: 'create' | 'edit';
  loading: boolean;
}

export function AssignmentFormActions({ mode, loading }: AssignmentFormActionsProps) {
  return (
    <div className="flex gap-4 justify-end">
      <Button variant="outline" asChild disabled={loading}>
        <Link href="/dashboard/assignments">Cancel</Link>
      </Button>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === 'create' ? 'Create Assignment' : 'Update Assignment'}
      </Button>
    </div>
  );
}
