'use client';

import { useState, FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import FormAlert from '@/components/shared/FormAlert';
import { Eye, EyeOff } from 'lucide-react';
import { ResetPasswordSchema } from '@/schemas/AuthSchema';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export default function ResetPasswordForm({
  onSuccess,
}: ResetPasswordFormProps) {
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

  const validate = () => {
    if (!touched.newPassword && !touched.confirmPassword) return null;

    const result = ResetPasswordSchema.safeParse({
      password: newPassword,
      confirmPassword,
    });

    if (result.success) return null;

    // Return only the first relevant error based on touched fields
    for (const issue of result.error.issues) {
      if (issue.path[0] === 'password' && touched.newPassword) return issue.message;
      if (issue.path[0] === 'confirmPassword' && touched.confirmPassword) return issue.message;
    }
    return null;
  };

  const validationError = validate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });

    const result = ResetPasswordSchema.safeParse({
      password: newPassword,
      confirmPassword,
    });

    if (!result.success) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

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
      // Default behavior: redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  if (success) {
    return (
      <FormAlert
        type="success"
        title="Password reset successfully"
        message="Redirecting to dashboard..."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onBlur={() => setTouched({ ...touched, newPassword: true })}
            required
            minLength={6}
            className="pr-10"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched({ ...touched, confirmPassword: true })}
            required
            minLength={6}
            className="pr-10"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {validationError && <FormAlert type="error" message={validationError} />}
      {error && <FormAlert type="error" message={error} />}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
}
