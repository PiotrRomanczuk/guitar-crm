'use client';

import React, { useState } from 'react';
import { SongInputSchema, Song } from '@/schemas/SongSchema';
import SongFormFields from './Fields';
import { createFormData, clearFieldError, parseZodErrors } from './helpers';

interface Props {
  mode: 'create' | 'edit';
  song?: Song;
  onSuccess?: () => void;
}

async function saveSong(mode: 'create' | 'edit', data: unknown, songId?: string) {
  try {
    const endpoint = mode === 'create' ? '/api/song' : `/api/song?id=${songId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { error: new Error(json.error || `Request failed: ${res.status}`) } as const;
    }
    const json = await res.json().catch(() => ({}));
    return { error: null, data: json } as const;
  } catch (e) {
    return { error: e instanceof Error ? e : new Error('Network error') } as const;
  }
}

export default function SongFormContent({ mode, song, onSuccess }: Props) {
  const [formData, setFormData] = useState(createFormData(song));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
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

    try {
      const validatedData = SongInputSchema.parse(formData);
      const { error } = await saveSong(mode, validatedData, song?.id);
      if (error) {
        setSubmitError('Failed to save song');
        return;
      }

      onSuccess?.();
    } catch (err) {
      const fieldErrors = parseZodErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
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
