'use client';

import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import {
  AuthInput,
  AuthAlert,
  AuthFooter,
  AuthLink,
} from './AuthFormComponents';

/**
 * Forgot Password Form
 * Migrated to shadcn/ui components per CLAUDE.md Form Standards
 */

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const getEmailError = (): string | null => {
    if (!touched) return null;
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
    return null;
  };

  const emailError = getEmailError();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await resetPassword(email);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <AuthInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        onBlur={() => setTouched(true)}
        error={emailError}
        required
        autoComplete="email"
      />

      {error && <AuthAlert message={error} />}
      {success && (
        <AuthAlert message="Check your email for the reset link" variant="success" />
      )}

      <Button type="submit" disabled={loading || !!emailError} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <AuthFooter>
        <AuthLink href="/sign-in">Back to sign in</AuthLink>
      </AuthFooter>
    </form>
  );
}
