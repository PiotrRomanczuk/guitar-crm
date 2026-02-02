'use client';

import { useState, useEffect } from 'react';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

/**
 * Convert ISO datetime string to datetime-local format (YYYY-MM-DDTHH:mm)
 * For input elements of type="datetime-local"
 */
function formatScheduledAtForInput(iso?: string): string {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return '';

    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

export interface LessonFormData {
  student_id: string;
  teacher_id: string;
  scheduled_at: string;
  title?: string;
  notes?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  song_ids?: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
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
    scheduled_at: formatScheduledAtForInput(initialData?.scheduled_at),
    title: initialData?.title || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'SCHEDULED',
    song_ids: initialData?.song_ids || [],
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [students, setStudents] = useState<Profile[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students and teachers
  useEffect(() => {
    async function fetchProfiles() {
      try {
        const supabase = createClient();

        const [studentsRes, teachersRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('is_student', true)
            .order('full_name'),
          supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('is_teacher', true)
            .order('full_name'),
        ]);

        if (studentsRes.error) throw studentsRes.error;
        if (teachersRes.error) throw teachersRes.error;

        setStudents(studentsRes.data || []);
        setTeachers(teachersRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profiles');
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof LessonFormData) => {
    // Validate single field on blur
    try {
      const schema = partial ? LessonInputSchema.partial() : LessonInputSchema;
      const fieldValue = formData[field];

      // Only validate if field has a value or is required
      if (fieldValue || !partial) {
        schema.pick({ [field]: true } as any).parse({ [field]: fieldValue });

        // Clear error if validation passes
        if (validationErrors[field]) {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues.find((issue) => issue.path[0] === field);
        if (fieldError) {
          setValidationErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        }
      }
    }
  };

  const handleSongChange = (songIds: string[]) => {
    setFormData((prev) => ({ ...prev, song_ids: songIds }));
  };

  const handleSubmit = async () => {
    try {
      setValidationErrors({});
      setError(null);

      // Frontend validation for required fields
      const frontendErrors: ValidationErrors = {};
      if (!formData.student_id) frontendErrors.student_id = 'Please select a student';
      if (!formData.teacher_id) frontendErrors.teacher_id = 'Please select a teacher';
      if (!formData.scheduled_at) frontendErrors.scheduled_at = 'Scheduled date & time is required';

      if (Object.keys(frontendErrors).length > 0) {
        setValidationErrors(frontendErrors);
        setError('Please fill in all required fields');
        return { success: false, error: 'Please fill in all required fields' };
      }

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

      const url = lessonId ? `/api/lessons/${lessonId}` : '/api/lessons';
      const method = lessonId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save lesson' }));
        setError(errorData.error || 'Failed to save lesson');
        return { success: false, error: errorData.error };
      }

      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        err.issues.forEach((e) => {
          errors[e.path[0] as string] = e.message;
        });
        setValidationErrors(errors);
        setError('Please fix the validation errors');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save lesson');
      }

      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    formData,
    students,
    teachers,
    loading,
    error,
    validationErrors,
    handleChange,
    handleBlur,
    handleSongChange,
    handleSubmit,
  };
}
