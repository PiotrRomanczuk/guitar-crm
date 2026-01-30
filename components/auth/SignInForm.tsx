'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import {
  AuthInput,
  AuthPasswordInput,
  AuthAlert,
  AuthDivider,
  GoogleButton,
  AuthFooter,
  AuthLink,
} from './AuthFormComponents';

/**
 * Sign In Form
 * Migrated to shadcn/ui components per CLAUDE.md Form Standards
 */

interface SignInFormProps {
  onSuccess?: () => void;
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const getFieldError = (field: 'email' | 'password'): string | null => {
    if (!touched[field]) return null;

    if (field === 'email') {
      if (!email) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
    }

    if (field === 'password') {
      if (!password) return 'Password is required';
    }

    return null;
  };

  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');
  const hasErrors = emailError || passwordError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

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
      if (signInError.message === 'Invalid login credentials') {
        setError(
          'Invalid email or password. If you haven\'t set a password yet, please use "Forgot password?" to create one.'
        );
      } else {
        setError(signInError.message);
      }
      return;
    }

    if (data.user) {
      setEmail('');
      setPassword('');
      setTouched({ email: false, password: false });
      onSuccess?.();
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
    <div className="space-y-6">
      <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          onBlur={() => setTouched({ ...touched, email: true })}
          error={emailError}
          required
          autoComplete="email"
          data-testid="email"
        />

        <AuthPasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          onBlur={() => setTouched({ ...touched, password: true })}
          error={passwordError}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          required
          autoComplete="current-password"
          data-testid="password"
        />

        <div className="flex justify-end">
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>

        {error && <AuthAlert message={error} />}

        <Button
          type="submit"
          disabled={loading || !isHydrated || !!hasErrors}
          className="w-full"
          data-testid="signin-button"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Signing in...' : 'Continue'}
        </Button>

        <AuthFooter>
          Don&apos;t have an account? <AuthLink href="/sign-up">Create your account</AuthLink>
        </AuthFooter>
      </form>
    </div>
  );
}
