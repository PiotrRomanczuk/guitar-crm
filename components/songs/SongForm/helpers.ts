import { ZodError } from 'zod';

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
export function createFormData(song?: any): SongFormData {
  return {
    ...FORM_DEFAULTS,
    ...song,
    youtube_url: song?.youtube_url || '',
    gallery_images: song?.gallery_images || [],
  };
}
