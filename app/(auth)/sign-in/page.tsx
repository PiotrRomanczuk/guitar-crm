'use client';

import { useEffect, useState, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { createClient } from '@/lib/supabase/client';
import { SignInSchema } from '@/schemas/AuthSchema';
import { AuthLayout, AuthHeader, AuthDivider, GoogleAuthButton } from '@/components/auth';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FormAlert from '@/components/shared/FormAlert';
import { SimpleDatabaseStatus } from '@/components/debug/SimpleDatabaseStatus';
import { Mail, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SignInPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    };
    checkUser();
  }, [router]);

  // Validate fields using useMemo to avoid setState in effect
  const fieldErrors = useMemo(() => {
    if (!touched.email && !touched.password) return {};

    const errors: { email?: string; password?: string } = {};
    const result = SignInSchema.safeParse({ email, password });
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (touched[field] && !errors[field]) {
          errors[field] = issue.message;
        }
      }
    }
    return errors;
  }, [email, password, touched]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const result = SignInSchema.safeParse({ email, password });
    if (!result.success) return;

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
        setError('Invalid email or password. If you haven\'t set a password yet, please use "Forgot password?" to create one.');
      } else {
        setError(signInError.message);
      }
      return;
    }

    if (data.user) {
      router.refresh();
      router.push('/dashboard');
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

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <SimpleDatabaseStatus />

      <AuthHeader
        title="Sign in to Strummy"
        subtitle="Manage your studio with AI-powered tools."
      />

      {/* Google Auth */}
      <GoogleAuthButton
        onClick={handleGoogleSignIn}
        disabled={loading}
        loading={loading}
      />

      <AuthDivider />

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              placeholder="name@example.com"
              aria-invalid={!!fieldErrors.email}
              className={cn(
                'h-12 pl-10 rounded-lg bg-card dark:bg-muted/30',
                fieldErrors.email && 'border-destructive'
              )}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          onBlur={() => setTouched({ ...touched, password: true })}
          error={fieldErrors.password}
          showForgotPassword
          autoComplete="current-password"
        />

        {/* Form Error */}
        {error && <FormAlert type="error" message={error} />}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-lg font-bold text-base mt-2"
        >
          {loading ? 'Signing in...' : 'Continue'}
          {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground mt-2">
        Don&apos;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-semibold text-primary hover:underline underline-offset-4 ml-1"
        >
          Create your account
        </Link>
      </div>

      {/* Pro Tip Card - only visible on larger screens */}
      <div className="mt-8 rounded-xl overflow-hidden relative h-32 w-full group hidden sm:block">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-card opacity-60"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
          <div>
            <p className="text-xs font-medium text-primary mb-0.5">Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              Automate your lesson scheduling today.
            </p>
          </div>
          <span className="text-muted-foreground/50">✨</span>
        </div>
      </div>
    </AuthLayout>
  );
}
