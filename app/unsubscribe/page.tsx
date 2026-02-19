import Link from 'next/link';
import { Suspense } from 'react';
import { NotificationType, NOTIFICATION_TYPE_INFO } from '@/types/notifications';

interface UnsubscribePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Unsubscribe Confirmation Page
 *
 * Shows confirmation after user unsubscribes from a notification type.
 * Displays:
 * - Success message with notification type
 * - Link to re-subscribe (settings page)
 * - Link to manage all preferences
 */
export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const success = params.success === 'true';
  const error = params.error as string | undefined;
  const notificationType = params.type as NotificationType | undefined;

  // Get notification type info
  const typeInfo =
    notificationType && NOTIFICATION_TYPE_INFO[notificationType]
      ? NOTIFICATION_TYPE_INFO[notificationType]
      : null;

  return (
    <Suspense fallback={<LoadingState />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Strummy
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Guitar Student Management
            </p>
          </div>

          {/* Success State */}
          {success && typeInfo && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  You&apos;ve Been Unsubscribed
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You will no longer receive emails for:
                </p>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {typeInfo.label}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {typeInfo.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/dashboard/settings"
                  className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Manage All Notification Preferences
                </Link>

                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg text-center transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Changed your mind? You can re-subscribe to this notification in your
                settings.
              </p>
            </div>
          )}

          {/* Error States */}
          {error && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {getErrorTitle(error)}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {getErrorMessage(error)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/dashboard/settings"
                  className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Go to Settings
                </Link>

                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg text-center transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* No params - generic message */}
          {!success && !error && (
            <div className="space-y-6 text-center">
              <div>
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Notification Preferences
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Manage your email notification preferences in your account settings.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/dashboard/settings"
                  className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Go to Settings
                </Link>

                <Link
                  href="/dashboard"
                  className="block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg text-center transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Get error title based on error code
 */
function getErrorTitle(error: string): string {
  switch (error) {
    case 'missing_params':
      return 'Invalid Request';
    case 'invalid_type':
      return 'Invalid Notification Type';
    case 'user_not_found':
      return 'User Not Found';
    case 'update_failed':
      return 'Update Failed';
    case 'server_error':
      return 'Server Error';
    default:
      return 'Something Went Wrong';
  }
}

/**
 * Get error message based on error code
 */
function getErrorMessage(error: string): string {
  switch (error) {
    case 'missing_params':
      return 'The unsubscribe link is missing required information. Please use the link from your email or manage preferences in settings.';
    case 'invalid_type':
      return 'The notification type specified is not valid. Please manage your preferences in settings.';
    case 'user_not_found':
      return 'We could not find your account. Please log in and manage your preferences in settings.';
    case 'update_failed':
      return 'We were unable to update your preferences. Please try again or manage your preferences in settings.';
    case 'server_error':
      return 'An unexpected error occurred. Please try again later or manage your preferences in settings.';
    default:
      return 'An error occurred while processing your request. Please manage your preferences in settings.';
  }
}
