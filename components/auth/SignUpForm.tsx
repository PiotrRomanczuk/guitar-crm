'use client';

import { Loader2, CheckCircle } from 'lucide-react';
import { useSignUpLogic } from './useSignUpLogic';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AuthInput,
  AuthPasswordInput,
  AuthAlert,
  AuthDivider,
  GoogleButton,
  AuthFooter,
  AuthLink,
} from './AuthFormComponents';
import { FormGrid } from '@/components/ui/form-wrapper';

/**
 * Sign Up Form
 * Migrated to shadcn/ui components per CLAUDE.md Form Standards
 */

interface SignUpFormProps {
  onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const state = useSignUpLogic(onSuccess);

  const getFieldError = (field: keyof typeof state.touched): string | null => {
    if (!state.touched[field]) return null;

    switch (field) {
      case 'firstName':
        return !state.firstName ? 'First name is required' : null;
      case 'lastName':
        return !state.lastName ? 'Last name is required' : null;
      case 'email':
        if (!state.email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return 'Invalid email address';
        return null;
      case 'password':
        if (!state.password) return 'Password is required';
        if (state.password.length < 6) return 'Password must be at least 6 characters';
        return null;
      case 'confirmPassword':
        if (!state.confirmPassword) return 'Please confirm your password';
        if (state.password !== state.confirmPassword) return 'Passwords do not match';
        return null;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={state.handleSubmit} className="space-y-6">
      <FormGrid>
        <AuthInput
          id="firstName"
          label="First Name"
          value={state.firstName}
          onChange={(e) => state.setFirstName(e.target.value)}
          onBlur={() => state.setTouched({ ...state.touched, firstName: true })}
          error={getFieldError('firstName')}
          required
          autoComplete="given-name"
        />

        <AuthInput
          id="lastName"
          label="Last Name"
          value={state.lastName}
          onChange={(e) => state.setLastName(e.target.value)}
          onBlur={() => state.setTouched({ ...state.touched, lastName: true })}
          error={getFieldError('lastName')}
          required
          autoComplete="family-name"
        />
      </FormGrid>

      <AuthInput
        id="email"
        label="Email Address"
        type="email"
        value={state.email}
        onChange={(e) => state.setEmail(e.target.value)}
        onBlur={() => state.setTouched({ ...state.touched, email: true })}
        error={getFieldError('email')}
        required
        autoComplete="email"
      />

      <div className="space-y-2">
        <AuthPasswordInput
          id="password"
          label="Password"
          value={state.password}
          onChange={(e) => state.setPassword(e.target.value)}
          onBlur={() => state.setTouched({ ...state.touched, password: true })}
          error={getFieldError('password')}
          showPassword={false}
          onToggleShow={() => {}}
          required
          autoComplete="new-password"
        />
        <PasswordStrengthIndicator password={state.password} />
      </div>

      <AuthInput
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        value={state.confirmPassword}
        onChange={(e) => state.setConfirmPassword(e.target.value)}
        onBlur={() => state.setTouched({ ...state.touched, confirmPassword: true })}
        error={getFieldError('confirmPassword')}
        required
        autoComplete="new-password"
      />

      {/* Password match indicator */}
      {state.confirmPassword && state.touched.confirmPassword && (
        <div className="flex items-center gap-2 text-xs">
          {state.password === state.confirmPassword ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">Passwords match</span>
            </>
          ) : null}
        </div>
      )}

      {state.error && <AuthAlert message={state.error} />}

      {state.success && (
        <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            <div className="space-y-2">
              <p className="font-medium">Verification Email Sent!</p>
              <p className="text-sm">
                We&apos;ve sent a confirmation email to: <strong>{state.email}</strong>
              </p>
              <div className="text-sm space-y-1">
                <p className="font-medium">What to do next:</p>
                <ol className="list-decimal list-inside space-y-0.5 ml-2">
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the verification link</li>
                  <li>You&apos;ll be redirected back to sign in</li>
                </ol>
              </div>
              {state.canResendEmail && (
                <button
                  type="button"
                  onClick={state.handleResendEmail}
                  disabled={state.resendLoading || state.resendCountdown > 0}
                  className="mt-2 text-sm text-green-700 dark:text-green-300 underline hover:text-green-800 dark:hover:text-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.resendCountdown > 0
                    ? `Resend available in ${state.resendCountdown}s`
                    : state.resendLoading
                    ? 'Sending...'
                    : "Didn't receive the email? Resend"}
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={state.loading} className="w-full">
        {state.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {state.loading ? 'Signing up...' : 'Sign Up'}
      </Button>

      <AuthDivider text="Or continue with" />

      <GoogleButton
        onClick={state.handleGoogleSignIn}
        disabled={state.loading}
        label="Sign up with Google"
      />

      <AuthFooter>
        Already have an account? <AuthLink href="/sign-in">Sign in</AuthLink>
      </AuthFooter>
    </form>
  );
}
