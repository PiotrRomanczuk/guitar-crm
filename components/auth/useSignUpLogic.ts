'use client';

import { useState, FormEvent, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { SignUpSchema } from '@/schemas/AuthSchema';

interface TouchedFields {
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  firstName: boolean;
  lastName: boolean;
}

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

interface SignUpResponse {
  data: { user: { identities?: unknown[] } | null };
  error: { message: string } | null;
}

function getFieldErrors(
  touched: TouchedFields,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string
): FieldErrors {
  const errors: FieldErrors = {};
  const result = SignUpSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FieldErrors;
      if (touched[field] && !errors[field]) {
        errors[field] = issue.message;
      }
    }
  }

  return errors;
}

async function signUpUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<SignUpResponse> {
  const supabase = getSupabaseBrowserClient();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
}

function validateFormData(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string
): boolean {
  const result = SignUpSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });
  return result.success;
}

function checkIfEmailExists(user: { identities?: unknown[] } | null): boolean {
  return (user?.identities?.length ?? 0) === 0;
}

export function useSignUpLogic(onSuccess?: () => void) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
  });
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Start countdown timer after successful registration
  useEffect(() => {
    if (success && !canResendEmail) {
      const timer = setTimeout(() => {
        setCanResendEmail(true);
      }, 5000); // Allow resend after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [success, canResendEmail]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newTouched = {
      email: true,
      password: true,
      confirmPassword: true,
      firstName: true,
      lastName: true,
    };
    setTouched(newTouched);

    if (!validateFormData(firstName, lastName, email, password, confirmPassword)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const response = await signUpUser(email, password, firstName, lastName);

    setLoading(false);
    if (response.error) {
      // Improve error messaging
      const errorMessage = response.error.message;
      if (errorMessage.includes('already registered') || errorMessage.includes('already been registered')) {
        setError(
          'This email is already registered. Please sign in or use the "Forgot Password" link to reset your password.'
        );
      } else {
        setError(errorMessage);
      }
      return;
    }

    if (response.data.user && checkIfEmailExists(response.data.user)) {
      // Shadow user - admin-created account without password
      setError(
        'This email is associated with an invitation. Please check your email for the invitation link, or use "Forgot Password" to claim your account.'
      );
      return;
    }

    if (response.data.user) {
      setSuccess(true);
      setCanResendEmail(false); // Will be enabled after 5 seconds
      if (onSuccess) onSuccess();
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    setResendLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Start 60-second countdown
      setResendCountdown(60);
      setCanResendEmail(false);

      // Re-enable after countdown
      setTimeout(() => {
        setCanResendEmail(true);
      }, 60000);
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loading,
    error,
    success,
    touched,
    setTouched,
    fieldErrors: getFieldErrors(touched, firstName, lastName, email, password, confirmPassword),
    handleSubmit,
    handleGoogleSignIn,
    handleResendEmail,
    canResendEmail,
    resendLoading,
    resendCountdown,
  };
}
