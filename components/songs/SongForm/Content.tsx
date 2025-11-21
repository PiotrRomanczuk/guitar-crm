'use client';

import React, { useState } from 'react';
import { SongInputSchema, Song } from '@/schemas/SongSchema';
import SongFormFields from './Fields';
import { createFormData, clearFieldError, parseZodErrors } from './helpers';
import { useSongMutation } from './useSongMutation';

interface Props {
  mode: 'create' | 'edit';
  song?: Song;
  onSuccess?: () => void;
}

export default function SongFormContent({ mode, song, onSuccess }: Props) {
  const [formData, setFormData] = useState(createFormData(song));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { saveSong, isSubmitting, submitError } = useSongMutation({
    mode,
    songId: song?.id,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => clearFieldError(prev, field));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = SongInputSchema.parse(formData);

      await saveSong(validatedData);
    } catch (err) {
      const fieldErrors = parseZodErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
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
