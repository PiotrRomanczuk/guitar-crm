'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@/components/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [showSuccessRedirect, setShowSuccessRedirect] = useState(false);

  const handleSuccess = () => {
    setShowSuccessRedirect(true);
  };

  if (showSuccessRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <svg
                  className="h-12 w-12 text-green-600 dark:text-green-400"
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

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Registration Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please check your email to verify your account before signing in.
              </p>
            </div>

            <button
              onClick={() => router.push('/sign-in')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎸 Guitar CRM
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Create your account
          </p>
        </div>
        <SignUpForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
