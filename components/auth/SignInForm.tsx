'use client';

import { useState, FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface SignInFormProps {
  onSuccess?: () => void;
}

function EmailInput({
  value,
  onChange,
  onBlur,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <label
        htmlFor="email"
        className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
      >
        Email Address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required
        data-testid="email"
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500"
      />
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  onBlur,
  showPassword,
  onToggleShow,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  showPassword: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <label
        htmlFor="password"
        className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
      >
        Password
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          data-testid="password"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}

function AlertMessage({
  message,
  type = 'error',
}: {
  message: string;
  type?: 'error' | 'success';
}) {
  return (
    <div
      role="alert"
      className={`p-2 sm:p-3 text-xs sm:text-sm rounded-lg border ${
        type === 'error'
          ? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 border-red-200 dark:border-red-800'
          : 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 border-green-200 dark:border-green-800'
      }`}
    >
      {message}
    </div>
  );
}

function SignInFooter() {
  return (
    <div className="space-y-2 text-xs sm:text-sm">
      <p className="text-center">
        <a
          href="/forgot-password"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Forgot password?
        </a>
      </p>

      <p className="text-center text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <a
          href="/sign-up"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validate = () => {
    if (touched.email && !email) return 'Email is required';
    if (touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
    if (touched.password && !password) return 'Password is required';
    return null;
  };

  const validationError = validate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    if (!email || !password) {
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      // Handle specific error for shadow users who haven't set a password yet
      if (signInError.message === 'Invalid login credentials') {
        // This is a generic error, but for shadow users it might mean they have no password.
        // We can't distinguish easily on client side without exposing user existence.
        // But we can suggest checking if they need to reset password.
        setError('Invalid email or password. If you haven\'t set a password yet, please use "Forgot password?" to create one.');
      } else {
        setError(signInError.message);
      }
      return;
    }

    if (data.user) {
      setEmail('');
      setPassword('');
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <EmailInput
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched({ ...touched, email: true })}
      />
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched({ ...touched, password: true })}
        showPassword={showPassword}
        onToggleShow={() => setShowPassword((v) => !v)}
      />
      {validationError && <AlertMessage message={validationError} />}
      {error && <AlertMessage message={error} />}
      <button
        type="submit"
        disabled={loading}
        data-testid="signin-button"
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </button>

      <SignInFooter />
    </form>
  );
}
