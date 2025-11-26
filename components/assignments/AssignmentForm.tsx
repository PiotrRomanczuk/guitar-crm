'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Dispatch, SetStateAction } from 'react';
import { AssignmentFormFields } from './AssignmentForm.Fields';
import { AssignmentFormActions } from './AssignmentForm.Actions';

interface AssignmentFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED' | 'BLOCKED';
    user_id: string;
  };
  mode: 'create' | 'edit';
  userId?: string;
}

export default function AssignmentForm({ initialData, mode, userId }: AssignmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    due_date: initialData?.due_date || '',
    priority: initialData?.priority || 'MEDIUM',
    status: initialData?.status || 'OPEN',
    user_id: initialData?.user_id || userId || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitAssignment(formData, mode, initialData?.id, router, setLoading, setError);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/dashboard/assignments"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back to assignments
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {mode === 'create' ? 'Create Assignment' : 'Edit Assignment'}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AssignmentFormFields formData={formData} onChange={handleChange} />
          <AssignmentFormActions mode={mode} loading={loading} />
        </form>
      </div>
    </div>
  );
}

async function submitAssignment(
  formData: Record<string, string>,
  mode: string,
  id: string | undefined,
  router: ReturnType<typeof useRouter>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>
) {
  setLoading(true);
  setError(null);

  try {
    const url = mode === 'create' ? '/api/assignments' : `/api/assignments/${id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save assignment');
    }

    const data = await response.json();
    router.push(`/dashboard/assignments/${data.id}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
}
