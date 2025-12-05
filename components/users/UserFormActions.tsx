'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface UserFormActionsProps {
  loading: boolean;
  isEdit?: boolean;
}

export default function UserFormActions({ loading, isEdit }: UserFormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button type="submit" disabled={loading} data-testid="submit-button">
        {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        data-testid="cancel-button"
      >
        Cancel
      </Button>
    </div>
  );
}
