import { z } from 'zod';

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
  phone: z
    .string()
    .regex(/^(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, {
      message: 'Valid phone number required',
    })
    .optional()
    .or(z.literal('')),
  role: z.enum(['student', 'teacher', 'admin'], {
    message: 'Please select a role',
  }),
});

/** Type inferred from InviteUserSchema for form data */
export type InviteUserFormData = z.infer<typeof InviteUserSchema>;
