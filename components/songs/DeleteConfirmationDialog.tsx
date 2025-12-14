'use client';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  songTitle: string;
  hasLessonAssignments: boolean;
  lessonCount?: number;
  favoriteCount?: number;
  isDeleting?: boolean;
  error?: string | null;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  songTitle,
  hasLessonAssignments,
  lessonCount = 0,
  favoriteCount = 0,
  isDeleting = false,
  error,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      data-testid="delete-confirmation-dialog"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3
              className="text-lg font-medium text-gray-900"
              data-testid="delete-confirmation-title"
            >
              Delete Song
            </h3>
          </div>
        </div>

        <div className="mb-6">
          {error && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"
              data-testid="delete-error"
            >
              {error}
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete <strong>&ldquo;{songTitle}&rdquo;</strong>? This action
            cannot be undone.
          </p>

          {hasLessonAssignments && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Related assignments will be removed
                  </h4>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      {lessonCount > 0 && (
                        <li>{lessonCount} lesson assignment(s) will be removed</li>
                      )}
                      {favoriteCount > 0 && (
                        <li>{favoriteCount} user favorite(s) will be removed</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            data-testid="delete-cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
            data-testid="delete-confirm-button"
          >
            {isDeleting && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isDeleting ? 'Deleting...' : 'Delete Song'}
          </button>
        </div>
      </div>
    </div>
  );
}
