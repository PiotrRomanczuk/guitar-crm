import { z } from 'zod';

/**
 * Extract field errors from Zod validation error
 * Converts Zod error into a record of field names to error messages
 * 
 * @param error - Zod validation error
 * @returns Record mapping field names to error messages
 * 
 * @example
 * ```typescript
 * try {
 *   schema.parse(data);
 * } catch (err) {
 *   if (err instanceof z.ZodError) {
 *     const errors = extractFieldErrors(err);
 *     // errors = { email: 'Invalid email', password: 'Too short' }
 *   }
 * }
 * ```
 */
export function extractFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const field = err.path[0] as string;
    if (field && !fieldErrors[field]) {
      // Only set first error for each field
      fieldErrors[field] = err.message;
    }
  });
  
  return fieldErrors;
}

/**
 * Validate a single field with its schema
 * Useful for real-time validation on blur/change
 * 
 * @param schema - Zod schema for the field
 * @param value - Value to validate
 * @returns Validation result with success flag and data/error
 * 
 * @example
 * ```typescript
 * const emailSchema = z.string().email();
 * const result = validateField(emailSchema, 'test@example.com');
 * 
 * if (result.success) {
 *   console.log('Valid:', result.data);
 * } else {
 *   console.log('Error:', result.error);
 * }
 * ```
 */
export function validateField<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  try {
    const data = schema.parse(value);
    return { success: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Safe parse wrapper with typed error extraction
 * Combines safeParse with extractFieldErrors for convenience
 * 
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Success with data or failure with field errors
 * 
 * @example
 * ```typescript
 * const result = safeParseWithErrors(UserSchema, formData);
 * 
 * if (result.success) {
 *   await saveUser(result.data);
 * } else {
 *   setErrors(result.errors);
 * }
 * ```
 */
export function safeParseWithErrors<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): 
  | { success: true; data: z.infer<T>; errors: null }
  | { success: false; data: null; errors: Record<string, string> } 
{
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }
  
  return {
    success: false,
    data: null,
    errors: extractFieldErrors(result.error),
  };
}

/**
 * Clear a specific field error from an error record
 * Useful when user corrects a field
 * 
 * @param errors - Current error record
 * @param field - Field name to clear
 * @returns New error record without the specified field
 * 
 * @example
 * ```typescript
 * const handleChange = (field: string, value: string) => {
 *   setFormData(prev => ({ ...prev, [field]: value }));
 *   setErrors(prev => clearFieldError(prev, field));
 * };
 * ```
 */
export function clearFieldError(
  errors: Record<string, string>,
  field: string
): Record<string, string> {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}
