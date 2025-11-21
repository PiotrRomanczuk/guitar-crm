# Frontend Zod Validation Audit

**Date**: 2025-11-21  
**Status**: 🔄 **IN PROGRESS** - Frontend validation needs improvements  
**Reviewer Request**: @PiotrRomanczuk

---

## Executive Summary

This audit reviews Zod usage on the **frontend** (React components, forms, client-side validation) to ensure consistent validation patterns and user experience. While backend API routes have comprehensive validation, frontend forms show inconsistent Zod adoption.

### Current State

**Forms Using Zod Validation** ✅:
1. `components/dashboard/admin/UserForm.tsx` - Uses `UserUpdateSchema`
2. `components/songs/SongForm/Content.tsx` - Uses `SongInputSchema`
3. `components/lessons/useLessonForm.ts` - Uses `LessonInputSchema`

**Forms WITHOUT Zod Validation** ❌:
1. `components/assignments/AssignmentForm.tsx` - Manual validation only
2. `components/auth/SignInForm.tsx` - Custom validation functions
3. `components/auth/SignUpForm.tsx` - Custom validation functions
4. `components/users/useUserFormState.ts` - Basic null checks only

### Issues Identified

1. **Inconsistent Validation**: Some forms use Zod, others use custom validation
2. **No Client-Side Schema Reuse**: Backend schemas not consistently imported on frontend
3. **Duplicate Validation Logic**: Custom validators duplicate what Zod schemas already define
4. **Poor Error Messages**: Custom validation doesn't leverage Zod's descriptive errors
5. **No Type Safety**: Forms without Zod lack compile-time type checking for validation

---

## Detailed Analysis

### ✅ GOOD: Forms with Proper Zod Usage

#### 1. UserForm (Admin Dashboard)

**File**: `components/dashboard/admin/UserForm.tsx`

**Implementation**:
```typescript
import { UserUpdateSchema } from '@/schemas/UserSchema';
import { z } from 'zod';

// Validation on submit
if (mode === 'create') {
  const validationSchema = createUserValidationSchema();
  validationSchema.parse(formData);
} else {
  UserUpdateSchema.parse({ ...formData, id: user?.id });
}
```

**Strengths**:
- ✅ Uses existing schema from `@/schemas/UserSchema`
- ✅ Proper error handling with `z.ZodError`
- ✅ Extracts field errors for display
- ✅ Type-safe form data

---

#### 2. SongForm

**File**: `components/songs/SongForm/Content.tsx`

**Implementation**:
```typescript
import { SongInputSchema } from '@/schemas/SongSchema';

const validatedData = SongInputSchema.parse(formData);
const { error } = await saveSong(mode, validatedData, song?.id);
```

**Strengths**:
- ✅ Validates before API call
- ✅ Uses `parseZodErrors` helper for consistent error handling
- ✅ Clear field-level error display

---

#### 3. LessonForm

**File**: `components/lessons/useLessonForm.ts`

**Implementation**:
```typescript
import { LessonInputSchema } from '@/schemas/LessonSchema';
import { z } from 'zod';

// Validation before mutation
const validatedData = LessonInputSchema.parse(formData);
```

**Strengths**:
- ✅ Type-safe with `z.infer<typeof LessonInputSchema>`
- ✅ Integrated with TanStack Query mutations
- ✅ Proper error state management

---

### ❌ ISSUES: Forms Without Zod

#### 1. AssignmentForm

**File**: `components/assignments/AssignmentForm.tsx`

**Current State**: ❌ NO VALIDATION
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await submitAssignment(formData, mode, initialData?.id, router, setLoading, setError);
};

// No validation before submission!
```

**Problems**:
- No client-side validation before API call
- User sees errors only after server response
- No type safety for form data
- Duplicate validation logic (client should match server)

**Fix Required**:
```typescript
import { AssignmentInputSchema, AssignmentUpdateSchema } from '@/schemas/AssignmentSchema';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // Validate with Zod before API call
    const schema = mode === 'create' ? AssignmentInputSchema : AssignmentUpdateSchema;
    const validatedData = schema.parse(formData);
    
    await submitAssignment(validatedData, mode, initialData?.id, router, setLoading, setError);
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Display field errors
      setErrors(extractFieldErrors(err));
    }
  }
};
```

---

#### 2. SignUpForm

**File**: `components/auth/SignUpForm.tsx` + `components/auth/useSignUpLogic.ts`

**Current State**: ❌ CUSTOM VALIDATION
```typescript
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getValidationError(touched, email, password, firstName, lastName): string | null {
  if (touched.firstName && !firstName) return 'First name is required';
  if (touched.lastName && !lastName) return 'Last name is required';
  if (touched.email && email && !isValidEmail(email)) return 'Invalid email';
  if (touched.password && password && password.length < 6)
    return 'Password must be at least 6 characters';
  return null;
}
```

**Problems**:
- Regex email validation less robust than Zod's `.email()`
- Manual password length check
- No validation for edge cases (whitespace, special chars, etc.)
- Hard-coded error messages

**Fix Required**:
Create `schemas/AuthSchema.ts`:
```typescript
import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
  firstName: z.string().min(1, 'First name is required')
    .max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required')
    .max(50, 'Last name too long'),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
```

Then use in form:
```typescript
import { SignUpSchema } from '@/schemas/AuthSchema';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const validatedData = SignUpSchema.parse({
      email,
      password,
      firstName,
      lastName,
    });
    
    await signUpUser(validatedData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Display errors
    }
  }
};
```

---

#### 3. UserFormState (Users Dashboard)

**File**: `components/users/useUserFormState.ts`

**Current State**: ❌ MINIMAL VALIDATION
```typescript
async function saveUserToApi(payload: SaveUserPayload): Promise<void> {
  const { data } = payload;
  
  if (!data.email) throw new Error('Email is required'); // Only email check!
  
  // No other validation...
}
```

**Problems**:
- Only validates email presence, not format
- No validation for firstName, lastName
- No validation for role combinations
- Inconsistent with backend UserSchema

**Fix Required**:
```typescript
import { UserInputSchema, UserUpdateSchema } from '@/schemas/UserSchema';

async function saveUserToApi(payload: SaveUserPayload): Promise<void> {
  const { data, isEdit } = payload;
  
  // Validate with appropriate schema
  const schema = isEdit ? UserUpdateSchema : UserInputSchema;
  const validatedData = schema.parse(data);
  
  // Now send validated data to API
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validatedData),
  });
}
```

---

## Recommended Patterns

### Pattern 1: Form with Zod Validation

```typescript
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { MySchema } from '@/schemas/MySchema';

export function MyForm() {
  const [formData, setFormData] = useState<Partial<z.infer<typeof MySchema>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate with Zod
      const validatedData = MySchema.parse(formData);
      
      // Send to API
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      // Success handling
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Extract field errors
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as string;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else {
        // Handle other errors
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
    </form>
  );
}
```

---

### Pattern 2: Real-Time Field Validation (Optional)

For better UX, validate fields on blur:

```typescript
const handleBlur = (field: keyof typeof formData) => {
  try {
    // Validate single field
    const fieldSchema = MySchema.shape[field];
    fieldSchema.parse(formData[field]);
    
    // Clear error if valid
    setErrors(prev => ({ ...prev, [field]: '' }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      setErrors(prev => ({ ...prev, [field]: err.errors[0].message }));
    }
  }
};

// Usage
<input
  name="email"
  value={formData.email}
  onChange={handleChange}
  onBlur={() => handleBlur('email')}
/>
```

---

## Implementation Plan

### Phase 1: Create Missing Schemas ✅ (if needed)

- [x] `schemas/AssignmentSchema.ts` - Already exists
- [ ] `schemas/AuthSchema.ts` - **CREATE THIS** for SignIn/SignUp
- [x] `schemas/UserSchema.ts` - Already exists

### Phase 2: Update Forms Without Validation

**Priority 1 (High):**
1. [ ] `components/assignments/AssignmentForm.tsx` - Add Zod validation
2. [ ] `components/auth/SignUpForm.tsx` + `useSignUpLogic.ts` - Replace custom validation with Zod
3. [ ] `components/auth/SignInForm.tsx` - Replace custom validation with Zod

**Priority 2 (Medium):**
4. [ ] `components/users/useUserFormState.ts` - Add comprehensive validation
5. [ ] `components/auth/ForgotPasswordForm.tsx` - Add email validation
6. [ ] `components/auth/ResetPasswordForm.tsx` - Add password validation

### Phase 3: Create Validation Helpers

Create `lib/form-validation.ts`:
```typescript
import { z } from 'zod';

/**
 * Extract field errors from Zod error
 */
export function extractFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const field = err.path[0] as string;
    fieldErrors[field] = err.message;
  });
  return fieldErrors;
}

/**
 * Validate single field
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
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: 'Validation failed' };
  }
}
```

---

## Benefits of Frontend Zod Validation

1. **Consistency**: Same validation rules on frontend and backend
2. **Better UX**: Catch errors before API call (faster feedback)
3. **Type Safety**: Compile-time checking of form data types
4. **Maintainability**: Single source of truth for validation rules
5. **Better Error Messages**: Leverages Zod's descriptive error system
6. **Reduced API Calls**: Invalid requests never reach the server

---

## Testing Considerations

After implementing Zod validation:

1. **Unit Tests**: Test validation logic in isolation
```typescript
describe('AssignmentForm validation', () => {
  it('should reject invalid assignment data', () => {
    expect(() => AssignmentInputSchema.parse({
      title: '', // Too short
      priority: 'INVALID', // Invalid enum
    })).toThrow();
  });
});
```

2. **Integration Tests**: Test form submission with valid/invalid data
3. **E2E Tests**: Verify error messages display correctly

---

## Summary

### Current State
- ✅ 3 forms use Zod validation
- ❌ 4+ forms use custom validation or no validation
- ⚠️ Inconsistent patterns across codebase

### Action Items
1. Create `schemas/AuthSchema.ts` for authentication forms
2. Update AssignmentForm to use AssignmentInputSchema
3. Replace custom validation in auth forms with Zod
4. Add validation to UserFormState
5. Create shared validation helpers
6. Update documentation and examples

### Expected Outcome
- ✅ All forms use Zod validation
- ✅ Consistent validation patterns
- ✅ Better type safety
- ✅ Improved user experience
- ✅ Reduced code duplication

---

**Status**: Ready for implementation. Frontend validation needs significant improvement to match backend standards.
