import * as z from 'zod';

// DD.MM.YYYY date format regex
const europeanDateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

export const CsvSongRowSchema = z.object({
  date: z
    .string()
    .min(1, 'Date is required')
    .regex(europeanDateRegex, 'Date must be in DD.MM.YYYY format'),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  author: z.string().max(500, 'Author too long').optional().default(''),
});

export type CsvSongRow = z.infer<typeof CsvSongRowSchema>;

export const CsvSongImportRequestSchema = z.object({
  studentId: z.string().uuid('Student ID must be a valid UUID'),
  rows: z.array(CsvSongRowSchema).min(1, 'At least one row is required'),
  validateOnly: z.boolean().default(false),
});

export type CsvSongImportRequest = z.infer<typeof CsvSongImportRequestSchema>;

export type MatchStatus = 'matched' | 'low_confidence' | 'new';

export const CsvSongImportRowResultSchema = z.object({
  rowIndex: z.number(),
  date: z.string(),
  title: z.string(),
  author: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
  matchStatus: z.enum(['matched', 'low_confidence', 'new']),
  matchedSongTitle: z.string().optional(),
  matchScore: z.number().optional(),
  songId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  lessonCreated: z.boolean().default(false),
  songCreated: z.boolean().default(false),
});

export type CsvSongImportRowResult = z.infer<typeof CsvSongImportRowResultSchema>;

export const CsvSongImportResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  results: z.array(CsvSongImportRowResultSchema).optional(),
  summary: z
    .object({
      totalRows: z.number(),
      songsMatched: z.number(),
      songsCreated: z.number(),
      lessonsCreated: z.number(),
      lessonsExisting: z.number(),
      errors: z.number(),
    })
    .optional(),
});

export type CsvSongImportResult = z.infer<typeof CsvSongImportResultSchema>;

export interface SimilarSong {
  id: string;
  title: string;
  author: string | null;
  similarity: number;
}
