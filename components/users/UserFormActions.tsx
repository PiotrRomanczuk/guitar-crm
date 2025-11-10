'use client';

import { useRouter } from 'next/navigation';

interface UserFormActionsProps {
  loading: boolean;
  isEdit?: boolean;
}

export default function UserFormActions({ loading, isEdit }: UserFormActionsProps) {
  const router = useRouter();

  return (
    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        data-testid="submit-button"
      >
        {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
      </button>
      <button
        type="button"
        onClick={() => router.back()}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        data-testid="cancel-button"
      >
        Cancel
      </button>
    </div>
  );
}
