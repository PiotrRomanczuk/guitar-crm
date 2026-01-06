'use client';

import { useState, useEffect } from 'react';
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

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
    scheduled_at: initialData?.scheduled_at || '',
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
        console.error('Error fetching profiles:', err);
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
      console.log('[useLessonForm] handleSubmit called', { formData, lessonId });
      setValidationErrors({});
      setError(null);

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
      
      console.log('[useLessonForm] Validation passed', validatedData);

      const url = lessonId ? `/api/lessons/${lessonId}` : '/api/lessons';
      const method = lessonId ? 'PUT' : 'POST';

      console.log('[useLessonForm] Sending request', { url, method });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      console.log('[useLessonForm] Response received', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save lesson' }));
        console.error('[useLessonForm] Error response:', errorData);
        setError(errorData.error || 'Failed to save lesson');
        return { success: false, error: errorData.error };
      }

      const responseData = await response.json();
      console.log('[useLessonForm] Success response:', responseData);
      
      return { success: true, data: responseData };
    } catch (err) {
      console.error('[useLessonForm] Submit error:', err);
      
      if (err instanceof z.ZodError) {
        const errors: ValidationErrors = {};
        err.issues.forEach((e) => {
          errors[e.path[0] as string] = e.message;
        });
        setValidationErrors(errors);
        setError('Please fix the validation errors');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save lesson';
        setError(errorMessage);
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
    handleSongChange,
    handleSubmit,
  };
}
