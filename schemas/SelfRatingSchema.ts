import * as z from 'zod';

export const SELF_RATING_LABELS: Record<number, string> = {
  1: 'Struggling',
  2: 'Needs Work',
  3: 'Okay',
  4: 'Comfortable',
  5: 'Mastered',
};

export const SelfRatingSchema = z.object({
  repertoireId: z.string().uuid('Repertoire entry must be a valid UUID'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

export type SelfRatingInput = z.infer<typeof SelfRatingSchema>;
