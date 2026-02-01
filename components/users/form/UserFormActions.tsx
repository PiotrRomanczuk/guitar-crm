'use client';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * User Form Actions
 * Standardized per CLAUDE.md Form Standards (Section 10)
 */

interface UserFormActionsProps {
  loading: boolean;
  isEdit?: boolean;
}

export default function UserFormActions({ loading, isEdit }: UserFormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
      <Button type="submit" disabled={loading} data-testid="submit-button">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={loading}
        data-testid="cancel-button"
      >
        Cancel
      </Button>
    </div>
  );
}
