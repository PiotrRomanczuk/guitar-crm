import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const createInitialData = (initial: InitialData | undefined): FormData => ({
  firstName: initial?.firstName || '',
  lastName: initial?.lastName || '',
  email: initial?.email || '',
  username: initial?.username || '',
  isAdmin: initial?.isAdmin || false,
  isTeacher: initial?.isTeacher || false,
  isStudent: initial?.isStudent || false,
  isActive: initial?.isActive !== false,
});

const saveUser = async (
  data: FormData,
  initialData: InitialData | undefined,
  isEdit: boolean | undefined
) => {
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
};

export function useUserFormState(
  initialData: InitialData | undefined,
  isEdit: boolean | undefined
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(createInitialData(initialData));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await saveUser(formData, initialData, isEdit);
      router.push('/dashboard/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit };
}
