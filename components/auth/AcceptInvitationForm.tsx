'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { StrongPasswordSchema } from '@/schemas/AuthSchema';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import FormAlert from '@/components/shared/FormAlert';
import { ArrowRight } from 'lucide-react';

export default function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordResult = StrongPasswordSchema.safeParse(password);
    if (!passwordResult.success) {
      setError(passwordResult.error.issues[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'invite';

    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Verify the OTP token from the invitation email
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'invite' | 'email',
    });

    if (verifyError) {
      setError('This invitation link has expired. Please request a new one.');
      setLoading(false);
      return;
    }

    // Set the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push('/onboarding');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PasswordInput
        id="password"
        label="Create Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        showStrength
        autoComplete="new-password"
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setError(null);
        }}
        autoComplete="new-password"
      />

      {error && <FormAlert type="error" message={error} />}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-lg font-bold text-base mt-2"
      >
        {loading ? 'Setting up...' : 'Set Password & Continue'}
        {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
      </Button>
    </form>
  );
}
