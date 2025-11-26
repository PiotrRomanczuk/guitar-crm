'use client';

import { useSignUpLogic } from './useSignUpLogic';

interface SignUpFormProps {
  onSuccess?: () => void;
}

function NameInputs({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onFirstNameBlur,
  onLastNameBlur,
}: {
  firstName: string;
  lastName: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFirstNameBlur: () => void;
  onLastNameBlur: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div className="space-y-1 sm:space-y-2">
        <label
          htmlFor="firstName"
          className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
        >
          First Name
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={firstName}
          onChange={onFirstNameChange}
          onBlur={onFirstNameBlur}
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500"
        />
      </div>

      <div className="space-y-1 sm:space-y-2">
        <label
          htmlFor="lastName"
          className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
        >
          Last Name
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={lastName}
          onChange={onLastNameChange}
          onBlur={onLastNameBlur}
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500"
        />
      </div>
    </div>
  );
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
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500"
      />
    </div>
  );
}

function PasswordInput({
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
        htmlFor="password"
        className="block text-xs sm:text-sm font-medium text-gray-900 dark:text-white"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required
        minLength={6}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500"
      />
      <p className="text-xs text-gray-600 dark:text-gray-400">Minimum 6 characters</p>
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
  const roleAttr = type === 'error' ? 'alert' : 'status';
  return (
    <div
      role={roleAttr}
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

function SignUpFooter() {
  return (
    <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
      Already have an account?{' '}
      <a
        href="/sign-in"
        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Sign in
      </a>
    </p>
  );
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const state = useSignUpLogic(onSuccess);

  return (
    <form onSubmit={state.handleSubmit} className="space-y-4 sm:space-y-6">
      <NameInputs
        firstName={state.firstName}
        lastName={state.lastName}
        onFirstNameChange={(e) => state.setFirstName(e.target.value)}
        onLastNameChange={(e) => state.setLastName(e.target.value)}
        onFirstNameBlur={() => state.setTouched({ ...state.touched, firstName: true })}
        onLastNameBlur={() => state.setTouched({ ...state.touched, lastName: true })}
      />

      <EmailInput
        value={state.email}
        onChange={(e) => state.setEmail(e.target.value)}
        onBlur={() => state.setTouched({ ...state.touched, email: true })}
      />

      <PasswordInput
        value={state.password}
        onChange={(e) => state.setPassword(e.target.value)}
        onBlur={() => state.setTouched({ ...state.touched, password: true })}
      />

      {state.validationError && <AlertMessage message={state.validationError} />}
      {state.error && <AlertMessage message={state.error} />}
      {state.success && <AlertMessage message="Check your email for confirmation" type="success" />}

      <button
        type="submit"
        disabled={state.loading}
        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {state.loading ? 'Signing up...' : 'Sign Up'}
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
        onClick={state.handleGoogleSignIn}
        disabled={state.loading}
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
        Sign up with Google
      </button>

      <SignUpFooter />
    </form>
  );
}
