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
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="max-w-md w-full">
          <div className="bg-background rounded-lg shadow-lg p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-3">
                <svg
                  className="h-12 w-12 text-success"
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
              <h2 className="text-2xl font-bold text-foreground">
                Registration Successful!
              </h2>
              <p className="text-muted-foreground">
                Please check your email to verify your account before signing in.
              </p>
            </div>

            <button
              onClick={() => router.push('/sign-in')}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Continue to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 to-primary/10 dark:from-background dark:to-muted flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-md w-full bg-background rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Guitar CRM
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create your account
          </p>
        </div>
        <SignUpForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
