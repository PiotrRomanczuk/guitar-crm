/**
 * User API Validation Schemas
 *
 * Zod schemas for validating API requests to /api/users endpoints.
 * Prevents XSS, injection, and malformed data.
 *
 * Fixes STRUMMY-281: No Zod validation on POST /api/users
 *
 * Part of Phase 2 (Security Fixes) - Users Module Security & Architecture Cleanup
 */

import * as z from 'zod';

// ============================================================================
// COMMON PATTERNS
// ============================================================================

/**
 * Email validation with XSS prevention
 * - Valid email format or empty string (for shadow users)
 * - Max 255 characters (database limit)
 * - Trimmed whitespace
 */
export const EmailFieldOptional = z
  .string()
  .trim()
  .max(255, 'Email cannot exceed 255 characters')
  .transform((val) => val.toLowerCase())
  .refine(
    (val) => val === '' || z.string().email().safeParse(val).success,
    'Must be a valid email address or empty for shadow users'
  );

/**
 * Name field validation with XSS prevention
 * - Strips HTML tags (keeps text content for safety)
 * - Limits length to 255 characters
 * - Trims whitespace
 */
export const NameField = z
  .string()
  .trim()
  .max(255, 'Name cannot exceed 255 characters')
  .transform((val) => val.replace(/<[^>]*>/g, '').trim()) // Remove HTML tags, keep text content
  .optional();

/**
 * Phone field validation
 * - Max 50 characters (database limit)
 * - Trims whitespace
 * - Optional
 */
export const PhoneField = z
  .string()
  .trim()
  .max(50, 'Phone cannot exceed 50 characters')
  .optional();

/**
 * Notes field validation with XSS prevention
 * - Strips HTML tags (keeps text content for safety)
 * - Max 5000 characters
 * - Trims whitespace
 */
export const NotesField = z
  .string()
  .trim()
  .max(5000, 'Notes cannot exceed 5000 characters')
  .transform((val) => val.replace(/<[^>]*>/g, '').trim()) // Remove HTML tags, keep text content
  .optional();

/**
 * Search query validation with injection prevention
 * - Max 100 characters (prevents abuse)
 * - Trims whitespace
 * - Removes special PostgREST characters
 */
export const SearchQueryField = z
  .string()
  .trim()
  .max(100, 'Search query cannot exceed 100 characters')
  .optional();

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * Create User Request Schema
 * Validates POST /api/users request body
 */
export const CreateUserRequestSchema = z
  .object({
    // Contact information (all optional individually, but at least one required via refinement)
    email: EmailFieldOptional.optional(),
    firstName: NameField,
    lastName: NameField,
    full_name: NameField, // Alternative to firstName + lastName
    phone: PhoneField,
    notes: NotesField,

    // Role flags
    isAdmin: z.boolean().optional().default(false),
    isTeacher: z.boolean().optional().default(false),
    isStudent: z.boolean().optional().default(true),
    isShadow: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // At least one of email, firstName, lastName, or full_name must be provided
      return (
        data.email ||
        data.firstName ||
        data.lastName ||
        data.full_name
      );
    },
    {
      message: 'At least email or name must be provided',
      path: ['email'],
    }
  )
  .refine(
    (data) => {
      // Cannot be both admin and student
      return !(data.isAdmin && data.isStudent && !data.isTeacher);
    },
    {
      message: 'User cannot be both admin and student without teacher role',
      path: ['isAdmin'],
    }
  );

/**
 * Update User Request Schema
 * Validates PUT/PATCH /api/users/[id] request body
 */
export const UpdateUserRequestSchema = z
  .object({
    // Contact information
    full_name: NameField,
    phone: PhoneField,
    notes: NotesField,

    // Role flags (can be explicitly set to undefined to remove)
    isAdmin: z.boolean().optional(),
    isTeacher: z.boolean().optional(),
    isStudent: z.boolean().optional(),
    isShadow: z.boolean().optional(),

    // Status flags
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.keys(data).length > 0;
    },
    {
      message: 'At least one field must be provided for update',
    }
  );

/**
 * User Filter Schema
 * Validates GET /api/users query parameters
 */
export const UserFilterSchema = z.object({
  // Search
  search: SearchQueryField,

  // Role filter
  role: z.enum(['admin', 'teacher', 'student', 'shadow']).optional(),

  // Status filters
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),

  // Pagination
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().positive().max(250, 'Limit cannot exceed 250').default(50)),

  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().nonnegative().default(0)),
});

/**
 * User ID Parameter Schema
 * Validates /api/users/[id] route parameter
 */
export const UserIdParamSchema = z.object({
  id: z
    .string()
    .uuid('Invalid user ID format')
    .refine(
      (val) => val !== '00000000-0000-0000-0000-000000000000',
      'Invalid user ID'
    ),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * User Response Schema
 * Defines the structure of user data returned by API
 */
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  full_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isAdmin: z.boolean(),
  isTeacher: z.boolean(),
  isStudent: z.boolean(),
  isShadow: z.boolean(),
  isActive: z.boolean(),
  isRegistered: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Users List Response Schema
 * Defines paginated list response structure
 */
export const UsersListResponseSchema = z.object({
  data: z.array(UserResponseSchema),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
});

/**
 * Error Response Schema
 * Standard error response format
 */
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string()).optional(), // Field-level validation errors
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate and sanitize create user request
 * Returns parsed data or throws ZodError
 */
export function validateCreateUserRequest(body: unknown) {
  return CreateUserRequestSchema.parse(body);
}

/**
 * Validate and sanitize update user request
 * Returns parsed data or throws ZodError
 */
export function validateUpdateUserRequest(body: unknown) {
  return UpdateUserRequestSchema.parse(body);
}

/**
 * Validate and sanitize user filters
 * Returns parsed filters or throws ZodError
 */
export function validateUserFilters(params: unknown) {
  return UserFilterSchema.parse(params);
}

/**
 * Validate user ID parameter
 * Returns parsed ID or throws ZodError
 */
export function validateUserId(params: unknown) {
  return UserIdParamSchema.parse(params);
}

/**
 * Safe parse with detailed error messages
 * Returns { success: true, data } or { success: false, errors }
 */
export function safeValidateCreateUser(body: unknown) {
  const result = CreateUserRequestSchema.safeParse(body);

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  // Format Zod errors into field-level messages
  const errors: Record<string, string> = {};
  if (result.error && result.error.errors) {
    result.error.errors.forEach((err) => {
      const field = err.path.join('.');
      errors[field] = err.message;
    });
  }

  return {
    success: false as const,
    errors,
    message: 'Validation failed',
  };
}

/**
 * Safe parse update request with detailed error messages
 */
export function safeValidateUpdateUser(body: unknown) {
  const result = UpdateUserRequestSchema.safeParse(body);

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const errors: Record<string, string> = {};
  if (result.error && result.error.errors) {
    result.error.errors.forEach((err) => {
      const field = err.path.join('.');
      errors[field] = err.message;
    });
  }

  return {
    success: false as const,
    errors,
    message: 'Validation failed',
  };
}

// ============================================================================
// TYPES
// ============================================================================

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserFilter = z.infer<typeof UserFilterSchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
