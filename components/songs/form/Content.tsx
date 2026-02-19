'use client';

import React, { useState, useCallback, useRef } from 'react';
import { SongInputSchema, SongDraftSchema, Song } from '@/schemas/SongSchema';
import SongFormFields from './Fields';
import MobileSongForm from './MobileSongForm';
import { createFormData, clearFieldError, parseZodErrors, SongFormData } from './helpers';
import { SpotifyTrack } from '@/types/spotify';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import FormActions from '@/components/shared/FormActions';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { checkSongDuplicate } from '@/app/actions/songs';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [formData, setFormData] = useState(createFormData(song));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const dupCheckTimer = useRef<ReturnType<typeof setTimeout>>(null);
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

  const runDuplicateCheck = useCallback(
    (title: string, author: string) => {
      if (dupCheckTimer.current) clearTimeout(dupCheckTimer.current);
      if (!title.trim() || !author.trim()) {
        setDuplicateWarning(null);
        return;
      }
      dupCheckTimer.current = setTimeout(async () => {
        const result = await checkSongDuplicate({
          title,
          author,
          excludeId: song?.id,
        });
        if (result.exists) {
          setDuplicateWarning(
            `A song called "${result.existingTitle}" by ${result.existingAuthor} already exists. You can still save if this is a different arrangement.`
          );
        } else {
          setDuplicateWarning(null);
        }
      }, 400);
    },
    [song?.id]
  );

  const handleBlur = (field: string) => {
    // Validate single field on blur
    try {
      const fieldSchema = SongInputSchema.shape[field as keyof typeof SongInputSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(formData[field as keyof SongFormData]);
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

    // Check for duplicates when title or author field loses focus
    if (field === 'title' || field === 'author') {
      runDuplicateCheck(formData.title, formData.author);
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
        setSubmitError(error.message);
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

  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSavingDraft(true);
    setErrors({});
    setSubmitError(null);

    try {
      // Validate as draft (only title required)
      const draftData = { ...formData, is_draft: true };
      const validatedData = SongDraftSchema.parse(draftData);

      const { error, data } = await saveSong(mode, validatedData, song?.id);
      if (error) {
        toast.error('Failed to save draft');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const savedSongId = (data as any)?.song?.id || song?.id;
      toast.success('Draft saved successfully');
      onSuccess?.(savedSongId);
    } catch (err) {
      const fieldErrors = parseZodErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        toast.error('Please fill required fields');
      } else {
        toast.error('Failed to save draft');
      }
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded">
          {submitError}
        </div>
      )}

      {duplicateWarning && (
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            {duplicateWarning}
          </AlertDescription>
        </Alert>
      )}

      {isMobile ? (
        <MobileSongForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onSpotifySelect={handleSpotifySelect}
        />
      ) : (
        <>
          <SongFormFields
            formData={formData}
            errors={errors}
            onChange={handleChange}
            onBlur={handleBlur}
            onSpotifySelect={handleSpotifySelect}
            sectionsState={sectionsState}
            onToggleSection={handleToggleSection}
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || isSavingDraft}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft || !formData.title}
              className="w-full sm:w-auto"
            >
              {isSavingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSavingDraft}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Song' : 'Update Song')}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
