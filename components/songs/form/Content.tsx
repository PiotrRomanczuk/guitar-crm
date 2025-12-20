'use client';

import React, { useState } from 'react';
import { SongInputSchema, Song } from '@/schemas/SongSchema';
import SongFormFields from './Fields';
import { createFormData, clearFieldError, parseZodErrors, SongFormData } from './helpers';

interface Props {
  mode: 'create' | 'edit';
  song?: Song;
  onSuccess?: () => void;
}

async function saveSong(mode: 'create' | 'edit', data: unknown, songId?: string) {
  try {
    const endpoint = mode === 'create' ? '/api/song' : `/api/song?id=${songId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    console.log('🎸 [FRONTEND] saveSong called:', { mode, endpoint, method, data });

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log('🎸 [FRONTEND] Response status:', res.status);

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      console.error('🎸 [FRONTEND] Error response:', json);
      return { error: new Error(json.error || `Request failed: ${res.status}`) } as const;
    }
    const json = await res.json().catch(() => ({}));
    console.log('🎸 [FRONTEND] Success response:', json);
    return { error: null, data: json } as const;
  } catch (e) {
    console.error('🎸 [FRONTEND] Exception caught:', e);
    return { error: e instanceof Error ? e : new Error('Network error') } as const;
  }
}

export default function SongFormContent({ mode, song, onSuccess }: Props) {
  const [formData, setFormData] = useState(createFormData(song));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: string, value: SongFormData[keyof SongFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => clearFieldError(prev, field));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    console.log('🎸 [FRONTEND] Form submitted:', { mode, formData });

    try {
      const validatedData = SongInputSchema.parse(formData);
      console.log('🎸 [FRONTEND] Validation passed:', validatedData);

      const { error } = await saveSong(mode, validatedData, song?.id);
      if (error) {
        console.error('🎸 [FRONTEND] Save failed:', error.message);
        setSubmitError('Failed to save song');
        return;
      }

      console.log('🎸 [FRONTEND] Save successful!');
      onSuccess?.();
    } catch (err) {
      console.error(
        '🎸 [FRONTEND] Submit error:',
        err instanceof Error ? err.message : String(err)
      );
      const fieldErrors = parseZodErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        console.log('🎸 [FRONTEND] Validation errors:', fieldErrors);
        setErrors(fieldErrors);
      } else {
        setSubmitError('Failed to save song');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <SongFormFields formData={formData} errors={errors} onChange={handleChange} />

      <button
        type="submit"
        disabled={isSubmitting}
        data-testid="song-save"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : 'Save song'}
      </button>
    </form>
  );
}
