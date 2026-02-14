import { z } from 'zod';
import { PhoneSchema } from './shared/phone';

/**
 * Schema for user invitation form validation.
 * Validates email, name, and role when inviting new users.
 */
export const InviteUserSchema = z.object({
  email: z.string().email('Valid email required'),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(200, 'Full name too long'),
  phone: PhoneSchema,
  role: z.enum(['student', 'teacher', 'admin'], {
    message: 'Please select a role',
  }),
});

/** Type inferred from InviteUserSchema for form data */
export type InviteUserFormData = z.infer<typeof InviteUserSchema>;
