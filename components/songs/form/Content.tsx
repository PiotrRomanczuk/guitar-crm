'use client';

import React, { useState } from 'react';
import { SongInputSchema, Song } from '@/schemas/SongSchema';
import SongFormFields from './Fields';
import { createFormData, clearFieldError, parseZodErrors, SongFormData } from './helpers';
import { SpotifyTrack } from '@/types/spotify';

interface Props {
  mode: 'create' | 'edit';
  song?: Song;
  onSuccess?: (songId?: string) => void;
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

    console.log('🎸 [FRONTEND] Form submitted:', { mode, formData });

    try {
      const validatedData = SongInputSchema.parse(formData);
      console.log('🎸 [FRONTEND] Validation passed:', validatedData);

      const { error, data } = await saveSong(mode, validatedData, song?.id);
      if (error) {
        console.error('🎸 [FRONTEND] Save failed:', error.message);
        setSubmitError('Failed to save song');
        return;
      }

      console.log('🎸 [FRONTEND] Save successful!');
      // data.song should be available from the API response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedSongId = (data as any)?.song?.id || song?.id;
      onSuccess?.(savedSongId);
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
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded">
          {submitError}
        </div>
      )}

      <SongFormFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSpotifySelect={handleSpotifySelect}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        data-testid="song-save"
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
      >
        {isSubmitting ? 'Saving...' : 'Save song'}
      </button>
    </form>
  );
}
