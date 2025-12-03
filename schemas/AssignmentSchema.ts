import * as z from 'zod';
import { IdField } from './CommonSchema';

// Assignment status enum (matches database enum)
export const AssignmentStatusEnum = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'overdue',
  'cancelled',
]);

// Assignment schema for validation
export const AssignmentSchema = z.object({
  id: IdField, // UUID, auto-generated
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  due_date: z.string().datetime().optional(), // ISO date string
  teacher_id: z.string().uuid(),
  student_id: z.string().uuid(),
  lesson_id: z.string().uuid().optional().nullable(), // Optional link to lesson
  status: AssignmentStatusEnum.default('not_started'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Assignment input schema for creating assignments
export const AssignmentInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  due_date: z.string().datetime().optional(), // ISO date string
  teacher_id: z.string().uuid(),
  student_id: z.string().uuid(),
  lesson_id: z.string().uuid().optional().nullable(), // Optional link to lesson
  status: AssignmentStatusEnum.optional(),
});

// Assignment update schema (partial of input)
export const AssignmentUpdateSchema = AssignmentInputSchema.partial().extend({
  id: z.string().uuid(),
});

// Assignment filter schema
export const AssignmentFilterSchema = z.object({
  teacher_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  lesson_id: z.string().uuid().optional(),
  status: AssignmentStatusEnum.optional(),
  search: z.string().optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
});

// Assignment sort schema
export const AssignmentSortSchema = z.object({
  field: z.enum(['due_date', 'created_at', 'updated_at', 'title', 'status']).default('due_date'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});
