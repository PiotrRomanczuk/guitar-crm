'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserInputSchema } from '@/schemas/UserSchema';
import { ZodError } from 'zod';

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isActive: boolean;
  isShadow: boolean;
}

interface InitialData {
  id: string | number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string | null;
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
  isActive: boolean;
  isShadow?: boolean | null;
}

interface SaveUserPayload {
  data: FormData;
  initialData: InitialData | undefined;
  isEdit: boolean | undefined;
}

const createInitialData = (initial: InitialData | undefined): FormData => {
  const defaultData: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    isAdmin: false,
    isTeacher: false,
    isStudent: false,
    isActive: true,
    isShadow: false,
  };

  if (!initial) return defaultData;

  return {
    firstName: initial.firstName || defaultData.firstName,
    lastName: initial.lastName || defaultData.lastName,
    email: initial.email || defaultData.email,
    username: initial.username || defaultData.username,
    isAdmin: initial.isAdmin || defaultData.isAdmin,
    isTeacher: initial.isTeacher || defaultData.isTeacher,
    isStudent: initial.isStudent || defaultData.isStudent,
    isActive: initial.isActive !== false,
    isShadow: initial.isShadow || defaultData.isShadow,
  };
};

async function saveUserToApi(payload: SaveUserPayload): Promise<void> {
  const { data, initialData, isEdit } = payload;

  if (!data.isShadow && !data.email) throw new Error('Email is required for standard users');

  const url = isEdit && initialData ? `/api/users/${initialData.id}` : '/api/users';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const apiData = await res.json();
    throw new Error(apiData.error || 'Failed to save user');
  }
}

function parseZodErrors(err: unknown): Record<string, string> {
  if (err instanceof ZodError) {
    return err.issues.reduce(
      (acc: Record<string, string>, e) => {
        const field = e.path[0]?.toString() || 'unknown';
        acc[field] = e.message;
        return acc;
      },
      {} as Record<string, string>
    );
  }
  return {};
}

export function useUserFormState(
  initialData: InitialData | undefined,
  isEdit: boolean | undefined
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(createInitialData(initialData));
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const {
    mutate: submitForm,
    isPending: loading,
    error: mutationError,
  } = useMutation({
    mutationFn: (payload: SaveUserPayload) => saveUserToApi(payload),
    onSuccess: () => {
      // Invalidate users list so it refetches with updated user
      queryClient.invalidateQueries({ queryKey: ['users'] });
      router.push('/dashboard/users');
    },
    onError: (err) => {
      // Try to parse Zod errors from the response
      if (err instanceof Error && err.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.errors) {
            setValidationErrors(parsed.errors);
          }
        } catch {
          // Not JSON, ignore
        }
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error on input
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (field: string) => {
    // Validate single field on blur
    try {
      const fieldSchema = UserInputSchema.shape[field as keyof typeof UserInputSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(formData[field as keyof FormData]);
        // Clear error if validation passes
        if (validationErrors[field]) {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      }
    } catch (err) {
      const fieldErrors = parseZodErrors(err);
      if (fieldErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate before submitting
    try {
      UserInputSchema.parse(formData);
      submitForm({ data: formData, initialData, isEdit });
    } catch (err) {
      const fieldErrors = parseZodErrors(err);
      setValidationErrors(fieldErrors);
    }
  };

  const error = mutationError
    ? mutationError instanceof Error
      ? mutationError.message
      : 'Unknown error'
    : null;

  return { formData, loading, error, validationErrors, handleChange, handleBlur, handleSubmit };
}
