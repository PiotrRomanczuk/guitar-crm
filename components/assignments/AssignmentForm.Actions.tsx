import Link from 'next/link';

interface AssignmentFormActionsProps {
  mode: 'create' | 'edit';
  loading: boolean;
}

export function AssignmentFormActions({ mode, loading }: AssignmentFormActionsProps) {
  return (
    <div className="flex gap-4 pt-4">
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        data-testid="submit-button"
      >
        {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
      </button>
      <Link
        href="/dashboard/assignments"
        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300"
      >
        Cancel
      </Link>
    </div>
  );
}
