import { ZodError } from 'zod';
import { Song } from '@/schemas/SongSchema';

/**
 * Helper function to handle form validation errors
 */
export function parseZodErrors(error: unknown): Record<string, string> {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    });
    return fieldErrors;
  }

  return {};
}

/**
 * Helper to clear a specific field error
 */
export function clearFieldError(
  errors: Record<string, string>,
  field: string
): Record<string, string> {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

export type SongFormData = {
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  key: string;
  ultimate_guitar_link: string;
  chords: string;
  short_title: string;
  youtube_url: string;
  gallery_images: string[];
};

const FORM_DEFAULTS: SongFormData = {
  title: '',
  author: '',
  level: 'beginner' as const,
  key: 'C' as const,
  ultimate_guitar_link: '',
  chords: '',
  short_title: '',
  youtube_url: '',
  gallery_images: [],
};

/**
 * Creates default form data from a song or empty values
 */
export function createFormData(song?: Song | null): SongFormData {
  return {
    ...FORM_DEFAULTS,
    title: song?.title || '',
    author: song?.author || '',
    level: song?.level || 'beginner',
    key: song?.key || 'C',
    ultimate_guitar_link: song?.ultimate_guitar_link || '',
    chords: song?.chords || '',
    short_title: song?.short_title || '',
    youtube_url: song?.youtube_url || '',
    gallery_images: song?.gallery_images || [],
  };
}
