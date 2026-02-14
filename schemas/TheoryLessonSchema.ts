import * as z from 'zod';

export const TheoreticalCourseLevelEnum = z.enum(['beginner', 'intermediate', 'advanced']);

// ---- Course schemas ----

export const TheoryCourseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).nullable().optional(),
  cover_image_url: z.string().url().nullable().optional(),
  level: TheoreticalCourseLevelEnum.default('beginner'),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const TheoryCourseInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  level: TheoreticalCourseLevelEnum.default('beginner'),
  is_published: z.boolean().default(false),
});

export type TheoryCourseInput = z.infer<typeof TheoryCourseInputSchema>;

// ---- Lesson (chapter) schemas ----

export const TheoryLessonSchema = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().default(''),
  excerpt: z.string().max(500).nullable().optional(),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const TheoryLessonInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().default(''),
  excerpt: z.string().max(500).optional(),
  is_published: z.boolean().default(false),
});

export type TheoryLessonInput = z.infer<typeof TheoryLessonInputSchema>;

// ---- Access schema ----

export const TheoryCourseAccessInputSchema = z.object({
  course_id: z.string().uuid(),
  user_ids: z.array(z.string().uuid()).min(1, 'Select at least one student'),
});

export type TheoryCourseAccessInput = z.infer<typeof TheoryCourseAccessInputSchema>;
