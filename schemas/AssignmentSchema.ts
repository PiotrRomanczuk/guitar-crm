import * as z from 'zod';
import { CommonSchema } from './CommonSchema';

// Assignment priority enum
export const AssignmentPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type AssignmentPriority = z.infer<typeof AssignmentPriorityEnum>;

// Assignment status enum
export const AssignmentStatusEnum = z.enum([
	'OPEN',
	'IN_PROGRESS',
	'PENDING_REVIEW',
	'COMPLETED',
	'CANCELLED',
	'BLOCKED',
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatusEnum>;

// Assignment input schema for creating assignments
export const AssignmentInputSchema = z.object({
	title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
	description: z.string().max(2000, 'Description must be under 2000 characters').optional(),
	due_date: z.string().optional().nullable(),
	priority: AssignmentPriorityEnum.default('MEDIUM'),
	status: AssignmentStatusEnum.default('OPEN'),
	user_id: CommonSchema.UUIDField,
});

export type AssignmentInput = z.infer<typeof AssignmentInputSchema>;

// Assignment update schema (for partial updates)
export const AssignmentUpdateSchema = AssignmentInputSchema.partial().extend({
	id: CommonSchema.UUIDField,
});

export type AssignmentUpdate = z.infer<typeof AssignmentUpdateSchema>;

// Full assignment schema (with metadata)
export const AssignmentSchema = AssignmentInputSchema.extend({
	id: CommonSchema.UUIDField,
	created_at: z.string(),
	updated_at: z.string(),
});

export type Assignment = z.infer<typeof AssignmentSchema>; 