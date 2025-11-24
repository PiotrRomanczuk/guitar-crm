'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';
import { queryClient } from '@/lib/query-client';
import { useProfiles } from './useProfiles';

interface FormData {
  student_id: string;
  teacher_id: string;
  date: string;
  start_time?: string;
  title?: string;
  notes?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface CreateLessonPayload {
  validatedData: z.infer<typeof LessonInputSchema>;
}

async function createLessonInApi(payload: CreateLessonPayload): Promise<void> {
  const response = await fetch('/api/lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload.validatedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create lesson');
  }
}

export default function useLessonForm() {
  const [formData, setFormData] = useState<FormData>({
    student_id: '',
    teacher_id: '',
    date: '',
    start_time: '',
    title: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Use extracted profiles hook
  const { students, teachers, loading, error: profilesError } = useProfiles();

  const {
    mutate: submitForm,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: async (payload: CreateLessonPayload) => {
      return createLessonInApi(payload);
    },
    onSuccess: () => {
      // Invalidate lessons list so it refetches with new lesson
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setValidationErrors({});

      const validatedData = LessonInputSchema.parse(formData);
      submitForm({ validatedData });
      return { success: true };
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        err.errors.forEach((e) => {
          errors[e.path[0] as string] = e.message;
        });
        setValidationErrors(errors);
      }
      return { success: false };
    }
  };

  const error = mutationError
    ? mutationError instanceof Error
      ? mutationError.message
      : 'Failed to create lesson'
    : profilesError;

  return {
    formData,
    students,
    teachers,
    loading: loading || isPending,
    error,
    validationErrors,
    handleChange,
    handleSubmit,
  };
}
