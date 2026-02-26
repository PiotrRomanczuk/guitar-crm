import * as z from 'zod';

/**
 * Status values for song requests
 */
export const SongRequestStatusEnum = z.enum(['pending', 'approved', 'rejected']);
export type SongRequestStatus = z.infer<typeof SongRequestStatusEnum>;

/**
 * Schema for submitting a new song request (student-facing form)
 */
export const SongRequestFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Song title is required')
    .max(200, 'Title must be under 200 characters'),
  artist: z
    .string()
    .max(100, 'Artist name must be under 100 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be under 500 characters')
    .optional()
    .or(z.literal('')),
  url: z
    .union([z.string().url('Please enter a valid URL'), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type SongRequestFormData = z.infer<typeof SongRequestFormSchema>;

/**
 * Schema for teacher review action
 */
export const SongRequestReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewNotes: z
    .string()
    .max(500, 'Review notes must be under 500 characters')
    .optional()
    .or(z.literal('')),
});

export type SongRequestReviewData = z.infer<typeof SongRequestReviewSchema>;

/**
 * Schema for filtering song requests
 */
export const SongRequestFilterSchema = z.object({
  status: SongRequestStatusEnum.optional(),
});

export type SongRequestFilter = z.infer<typeof SongRequestFilterSchema>;

/**
 * Full song request row type (matches database)
 */
export interface SongRequestRow {
  id: string;
  student_id: string;
  title: string;
  artist: string | null;
  notes: string | null;
  url: string | null;
  status: string;
  reviewed_by: string | null;
  review_notes: string | null;
  song_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Song request with student profile info (for teacher queue)
 */
export interface SongRequestWithStudent extends SongRequestRow {
  student: {
    id: string;
    full_name: string | null;
  } | null;
}
