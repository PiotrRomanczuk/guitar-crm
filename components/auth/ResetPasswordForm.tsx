'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuthPasswordInput, AuthAlert } from './AuthFormComponents';

/**
 * Reset Password Form
 * Migrated to shadcn/ui components per CLAUDE.md Form Standards
 */

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const getFieldError = (field: 'newPassword' | 'confirmPassword'): string | null => {
    if (!touched[field]) return null;

    if (field === 'newPassword') {
      if (!newPassword) return 'Password is required';
      if (newPassword.length < 6) return 'Password must be at least 6 characters';
    }

    if (field === 'confirmPassword') {
      if (!confirmPassword) return 'Please confirm your password';
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        return 'Passwords do not match';
      }
    }

    return null;
  };

  const newPasswordError = getFieldError('newPassword');
  const confirmPasswordError = getFieldError('confirmPassword');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setTouched({ newPassword: true, confirmPassword: true });

    if (!newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    if (onSuccess) {
      onSuccess();
    } else {
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  if (success) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Password reset successfully
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthPasswordInput
        id="newPassword"
        label="New Password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          if (error) setError(null);
        }}
        onBlur={() => setTouched({ ...touched, newPassword: true })}
        error={newPasswordError}
        showPassword={showNewPassword}
        onToggleShow={() => setShowNewPassword(!showNewPassword)}
        showHint="Minimum 6 characters"
        required
        autoComplete="new-password"
      />

      <AuthPasswordInput
        id="confirmPassword"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (error) setError(null);
        }}
        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
        error={confirmPasswordError}
        showPassword={showConfirmPassword}
        onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
        required
        autoComplete="new-password"
      />

      {error && <AuthAlert message={error} />}

      <Button
        type="submit"
        disabled={loading || !!newPasswordError || !!confirmPasswordError}
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
