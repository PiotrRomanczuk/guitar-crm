import * as z from 'zod';

// Lesson status enum - matches database enum Database["public"]["Enums"]["LessonStatus"]
export const LessonStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

// Lesson schema for validation
export const LessonSchema = z.object({
  id: z.string().uuid().optional(), // UUID, auto-generated
  student_id: z.string().uuid('Student ID is required'),
  teacher_id: z.string().uuid('Teacher ID is required'),
  creator_user_id: z.string().uuid().optional(),
  lesson_number: z.number().int().positive().nullable().optional(),
  lesson_teacher_number: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  scheduled_at: z.string().nullable().optional(), // ISO date string from database (timestamp)
  status: LessonStatusEnum.default('SCHEDULED'),
  created_at: z.string().nullable().optional(), // ISO date string from database
  updated_at: z.string().nullable().optional(), // ISO date string from database
});

// Lesson input schema for creating/updating lessons
export const LessonInputSchema = z.object({
  student_id: z.string().uuid('Student ID is required'),
  teacher_id: z.string().uuid('Teacher ID is required'),
  notes: z.string().optional(),
  scheduled_at: z.string().min(1, 'Scheduled date/time is required'), // ISO timestamp or date string
  status: LessonStatusEnum.optional(),
});

// Lesson with profile information
export const LessonWithProfilesSchema = LessonSchema.extend({
  profile: z
    .object({
      id: z.string().uuid(),
      full_name: z.string().nullable(),
      email: z.string().email(),
    })
    .optional()
    .nullable(),
  teacher_profile: z
    .object({
      id: z.string().uuid(),
      full_name: z.string().nullable(),
      email: z.string().email(),
    })
    .optional()
    .nullable(),
});

// Lesson song status enum
export const SongStatusEnum = z.enum([
  'to_learn',
  'started',
  'remembered',
  'with_author',
  'mastered',
]);

// Lesson song relationship schema
export const LessonSongSchema = z.object({
  lesson_id: z.string().uuid(),
  song_id: z.string().uuid(),
  song_status: SongStatusEnum.default('started'),
  student_id: z.string().uuid(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// Types
export type Lesson = z.infer<typeof LessonSchema>;
export type LessonInput = z.infer<typeof LessonInputSchema>;
export type LessonWithProfiles = z.infer<typeof LessonWithProfilesSchema>;
export type LessonSong = z.infer<typeof LessonSongSchema>;
export type LessonStatus = z.infer<typeof LessonStatusEnum>;
export type SongStatus = z.infer<typeof SongStatusEnum>;
