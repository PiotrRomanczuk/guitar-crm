'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/sign-in');
    }
  }, [countdown, autoRedirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
              <svg
                className="h-16 w-16 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Verified Successfully! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your email has been confirmed. You can now sign in to your account.
            </p>
          </div>

          {/* Countdown */}
          {autoRedirect && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting to sign in page in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue to Sign In
            </Link>
            <button
              onClick={() => setAutoRedirect(false)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel auto-redirect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
