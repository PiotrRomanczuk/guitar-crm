'use client';

import { useState, FormEvent } from 'react';
import { resetPassword } from '@/app/auth/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FormAlert from '@/components/shared/FormAlert';
import { ForgotPasswordSchema } from '@/schemas/AuthSchema';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export default function ForgotPasswordForm({
  onSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

  const validate = () => {
    if (!touched) return null;

    const result = ForgotPasswordSchema.safeParse({ email });
    if (result.success) return null;

    return result.error.issues[0]?.message || 'Invalid email';
  };

  const validationError = validate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const result = ForgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const resetResult = await resetPassword(email);

    setLoading(false);

    if (resetResult.error) {
      setError(resetResult.error);
      return;
    }

    setSuccess(true);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          required
          placeholder="you@example.com"
        />
      </div>

      {validationError && <FormAlert type="error" message={validationError} />}
      {error && <FormAlert type="error" message={error} />}
      {success && <FormAlert type="success" message="Check your email for the reset link" />}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>

      <p className="text-center text-sm">
        <a href="/sign-in" className="text-primary hover:underline">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
