import * as z from 'zod';
import { UUIDPattern } from '@/schemas/CommonSchema';

export const SetSongOfTheWeekSchema = z.object({
  song_id: UUIDPattern,
  teacher_message: z
    .string()
    .max(500, 'Message must be 500 characters or less')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  active_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type SetSongOfTheWeekInput = z.infer<typeof SetSongOfTheWeekSchema>;
