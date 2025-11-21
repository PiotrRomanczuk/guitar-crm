'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { LessonInputSchema, LessonSchema } from '@/schemas/LessonSchema';
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
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface ValidationErrors {
  [key: string]: string;
}

interface CreateLessonPayload {
  validatedData: z.infer<typeof LessonInputSchema>;
}

interface UpdateLessonPayload {
  id: string;
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

async function updateLessonInApi(payload: UpdateLessonPayload): Promise<void> {
  const response = await fetch(`/api/lessons/${payload.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload.validatedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update lesson');
  }
}

interface UseLessonFormProps {
  initialData?: z.infer<typeof LessonSchema>;
  lessonId?: string;
  onSuccess?: () => void;
}

export default function useLessonForm({
  initialData,
  lessonId,
  onSuccess,
}: UseLessonFormProps = {}) {
  const [formData, setFormData] = useState<FormData>(() => ({
    student_id: initialData?.student_id || '',
    teacher_id: initialData?.teacher_id || '',
    date: initialData?.date || '',
    start_time: initialData?.start_time || '',
    title: initialData?.title || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'SCHEDULED',
  }));

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Use extracted profiles hook
  const { students, teachers, loading, error: profilesError } = useProfiles();

  const {
    mutate: submitForm,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: async (payload: CreateLessonPayload | UpdateLessonPayload) => {
      if ('id' in payload) {
        return updateLessonInApi(payload);
      }
      return createLessonInApi(payload);
    },
    onSuccess: () => {
      // Invalidate lessons list so it refetches with new lesson
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      if (lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      }
      if (onSuccess) {
        onSuccess();
      }
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

      if (lessonId) {
        submitForm({ id: lessonId, validatedData });
      } else {
        submitForm({ validatedData });
      }
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
      : 'Failed to save lesson'
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
    isEditing: !!lessonId,
  };
}
