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
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="max-w-md w-full">
        <div className="bg-background rounded-lg shadow-lg p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-success/10 p-3">
              <svg
                className="h-16 w-16 text-success"
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
            <h1 className="text-2xl font-bold text-foreground">
              Email Verified Successfully!
            </h1>
            <p className="text-muted-foreground">
              Your email has been confirmed. You can now sign in to your account.
            </p>
          </div>

          {/* Countdown */}
          {autoRedirect && (
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in page in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Continue to Sign In
            </Link>
            <button
              onClick={() => setAutoRedirect(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel auto-redirect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
