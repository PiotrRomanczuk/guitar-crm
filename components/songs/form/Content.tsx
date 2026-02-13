'use client';

import React, { useState } from 'react';
import { SongInputSchema, Song } from '@/schemas/SongSchema';
import SongFormFields from './Fields';
import { createFormData, clearFieldError, parseZodErrors, SongFormData } from './helpers';
import { SpotifyTrack } from '@/types/spotify';
import { useRouter } from 'next/navigation';
import FormActions from '@/components/shared/FormActions';

interface Props {
  mode: 'create' | 'edit';
  song?: Song;
  onSuccess?: (songId?: string) => void;
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
  const router = useRouter();
  const [formData, setFormData] = useState(createFormData(song));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sectionsState, setSectionsState] = useState({
    resources: false,
    musical: false,
  });

  const handleChange = (field: string, value: SongFormData[keyof SongFormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => clearFieldError(prev, field));
    }
  };

  const handleToggleSection = (section: 'resources' | 'musical') => {
    setSectionsState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBlur = (field: string) => {
    // Validate single field on blur
    try {
      const fieldSchema = SongInputSchema.shape[field as keyof typeof SongInputSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(formData[field as keyof SongFormData]);
        // Clear error if validation passes
        if (errors[field]) {
          setErrors((prev) => clearFieldError(prev, field));
        }
      }
    } catch (err) {
      const fieldErrors = parseZodErrors(err);
      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    }
  };

  const handleSpotifySelect = async (track: SpotifyTrack) => {
    // Update basic info immediately
    setFormData((prev) => {
      // Add image if available and not already present
      const newImages =
        track.image && !prev.gallery_images.includes(track.image)
          ? [...prev.gallery_images, track.image]
          : prev.gallery_images;

      return {
        ...prev,
        title: track.name,
        author: track.artist,
        spotify_link_url: `https://open.spotify.com/track/${track.id}`,
        release_year: track.release_date ? parseInt(track.release_date.split('-')[0]) : null,
        gallery_images: newImages,
        cover_image_url: track.image || prev.cover_image_url,
      };
    });

    // Fetch audio features for key
    try {
      const res = await fetch(`/api/spotify/features?id=${track.id}`);
      const data = await res.json();

      if (data.key !== undefined && data.mode !== undefined) {
        const pitchClass = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        let key = pitchClass[data.key];
        if (data.mode === 0) {
          key += 'm';
        }

        setFormData((prev) => ({
          ...prev,
          key: key,
          tempo: data.tempo ? Math.round(data.tempo) : null,
          time_signature: data.time_signature || null,
          duration_ms: data.duration_ms || null,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch audio features', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const validatedData = SongInputSchema.parse(formData);

      const { error, data } = await saveSong(mode, validatedData, song?.id);
      if (error) {
        setSubmitError('Failed to save song');
        return;
      }

      // data.song should be available from the API response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedSongId = (data as any)?.song?.id || song?.id;
      onSuccess?.(savedSongId);
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
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded">
          {submitError}
        </div>
      )}

      <SongFormFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onBlur={handleBlur}
        onSpotifySelect={handleSpotifySelect}
        sectionsState={sectionsState}
        onToggleSection={handleToggleSection}
      />

      <FormActions
        isSubmitting={isSubmitting}
        submitText={mode === 'create' ? 'Create Song' : 'Update Song'}
        submittingText="Saving..."
        onCancel={() => router.back()}
        showCancel
      />
    </form>
  );
}
