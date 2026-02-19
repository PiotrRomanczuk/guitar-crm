import { z } from 'zod';

const phoneRegex = /^(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

/**
 * Shared phone validation schema.
 * Accepts international formats (+prefix), dashes, dots, spaces, parentheses.
 * Optional field: accepts empty string or undefined.
 */
export const PhoneSchema = z
  .string()
  .trim()
  .max(50, 'Phone cannot exceed 50 characters')
  .regex(phoneRegex, { message: 'Valid phone number required' })
  .optional()
  .or(z.literal(''));
