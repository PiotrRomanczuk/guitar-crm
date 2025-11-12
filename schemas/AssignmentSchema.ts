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

// Assignment update schema (for partial updates)
export const AssignmentUpdateSchema = AssignmentInputSchema.partial().extend({
  id: z.string().uuid(),
});

// Assignment with profile information
export const AssignmentWithProfilesSchema = AssignmentSchema.extend({
  teacher_profile: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      full_name: z.string().optional().nullable(),
    })
    .optional(),
  student_profile: z
    .object({
      id: z.string().uuid(),
      email: z.string().email(),
      full_name: z.string().optional().nullable(),
    })
    .optional(),
  lesson: z
    .object({
      id: z.string().uuid(),
      lesson_teacher_number: z.number().int().positive(),
      scheduled_at: z.string().datetime(),
    })
    .optional()
    .nullable(),
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
  field: z.enum(['title', 'due_date', 'created_at', 'updated_at', 'status']),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Assignment status calculation helper
export const calculateAssignmentStatus = (
  dueDate: string | null,
  currentStatus: z.infer<typeof AssignmentStatusEnum>
): z.infer<typeof AssignmentStatusEnum> => {
  // If already completed or cancelled, keep that status
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return currentStatus;
  }

  // If no due date, return current status
  if (!dueDate) return currentStatus || 'not_started';

  const now = new Date();
  const due = new Date(dueDate);

  // If overdue
  if (due < now) {
    return 'overdue';
  }

  return currentStatus || 'not_started';
};

// Types
export type Assignment = z.infer<typeof AssignmentSchema>;
export type AssignmentInput = z.infer<typeof AssignmentInputSchema>;
export type AssignmentUpdate = z.infer<typeof AssignmentUpdateSchema>;
export type AssignmentWithProfiles = z.infer<typeof AssignmentWithProfilesSchema>;
export type AssignmentFilter = z.infer<typeof AssignmentFilterSchema>;
export type AssignmentSort = z.infer<typeof AssignmentSortSchema>;
export type AssignmentStatus = z.infer<typeof AssignmentStatusEnum>;
