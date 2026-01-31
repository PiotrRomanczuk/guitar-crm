import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            There was an error authenticating with the provider. Please try again.
          </p>
        </div>
        <div className="mt-5">
          <Link
            href="/sign-in"
            className="font-medium text-primary hover:text-primary/80"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
