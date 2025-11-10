'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isActive: boolean;
}

interface InitialData {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string | null;
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
  isActive: boolean;
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
  };
};

async function saveUserToApi(payload: SaveUserPayload): Promise<void> {
  const { data, initialData, isEdit } = payload;

  if (!data.email) throw new Error('Email is required');

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

export function useUserFormState(
  initialData: InitialData | undefined,
  isEdit: boolean | undefined
) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(createInitialData(initialData));

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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm({ data: formData, initialData, isEdit });
  };

  const error = mutationError
    ? mutationError instanceof Error
      ? mutationError.message
      : 'Unknown error'
    : null;

  return { formData, loading, error, handleChange, handleSubmit };
}
