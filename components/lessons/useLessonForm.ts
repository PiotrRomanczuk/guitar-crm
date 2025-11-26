'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';
import { queryClient } from '@/lib/query-client';
import { useProfiles } from './useProfiles';

export interface LessonFormData {
  student_id: string;
  teacher_id: string;
  date: string;
  start_time?: string;
  title?: string;
  notes?: string;
  song_ids?: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface CreateLessonPayload {
  validatedData: Partial<z.infer<typeof LessonInputSchema>>;
  lessonId?: string;
}

async function submitLessonToApi(payload: CreateLessonPayload): Promise<void> {
  const url = payload.lessonId ? `/api/lessons/${payload.lessonId}` : '/api/lessons';
  const method = payload.lessonId ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload.validatedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save lesson');
  }
}

export interface UseLessonFormProps {
  initialData?: Partial<LessonFormData>;
  lessonId?: string;
  partial?: boolean;
  fieldsToSubmit?: (keyof LessonFormData)[];
}

export default function useLessonForm({
  initialData,
  lessonId,
  partial = false,
  fieldsToSubmit,
}: UseLessonFormProps = {}) {
  const [formData, setFormData] = useState<LessonFormData>({
    student_id: initialData?.student_id || '',
    teacher_id: initialData?.teacher_id || '',
    date: initialData?.date || '',
    start_time: initialData?.start_time || '',
    title: initialData?.title || '',
    notes: initialData?.notes || '',
    song_ids: initialData?.song_ids || [],
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Use extracted profiles hook
  const { students, teachers, loading, error: profilesError } = useProfiles();

  const {
    mutateAsync: submitForm,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: async (payload: CreateLessonPayload) => {
      return submitLessonToApi(payload);
    },
    onSuccess: () => {
      // Invalidate lessons list so it refetches with new lesson
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      if (lessonId) {
        queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
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

  const handleSongChange = (songIds: string[]) => {
    setFormData((prev) => ({ ...prev, song_ids: songIds }));
  };

  const handleSubmit = async () => {
    try {
      setValidationErrors({});

      let dataToValidate: Partial<LessonFormData> = formData;
      if (fieldsToSubmit) {
        dataToValidate = fieldsToSubmit.reduce((acc, key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc as any)[key] = formData[key];
          return acc;
        }, {} as Partial<LessonFormData>);
      }

      const schema = partial ? LessonInputSchema.partial() : LessonInputSchema;
      const validatedData = schema.parse(dataToValidate);
      await submitForm({ validatedData, lessonId });
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
    handleSongChange,
    handleSubmit,
  };
}
