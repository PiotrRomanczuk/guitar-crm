# Form & Validation Standards

**Status**: Established via discovery Q&A (Q6, Q18)  
**Last Updated**: October 26, 2025  
**Enforced By**: Code review, component tests

---

## Purpose

Establish patterns for form validation, submission, and error display. Ensures consistent UX across all forms (create lesson, add song, update profile, etc.) with optimal user feedback timing.

---

## Core Principles

1. **Validate on Blur**: Catch errors early without annoying users
2. **Zod Schemas**: All form inputs validated with Zod
3. **Real-Time Feedback**: Show validation errors as user types (after blur)
4. **Type Safety**: TypeScript interfaces + Zod = maximum safety
5. **Accessible**: Labels, ARIA attributes, keyboard navigation

---

## Form Validation Strategy: Blur + Submit

Your standard approach: validate on blur for early feedback, validate again on submit for final check.

```
User Types → Focus Out (blur) → Show Error
User Submits → Validate All → Show General Errors
```

### Schema Definition

Always define schemas in `schemas/` directory:

```typescript
// schemas/LessonSchema.ts
import { z } from 'zod';
import { CommonSchema } from './CommonSchema';

export const LessonInputSchema = z.object({
	title: z
		.string()
		.min(1, 'Lesson title is required')
		.max(100, 'Title must be under 100 characters'),
	description: z.string().optional(),
	studentId: CommonSchema.UUIDField.optional(),
	date: CommonSchema.DateField,
	notes: z.string().max(1000, 'Notes must be under 1000 characters').optional(),
});

export type LessonInput = z.infer<typeof LessonInputSchema>;

export const LessonUpdateSchema = LessonInputSchema.partial().extend({
	id: CommonSchema.UUIDField,
});

export type LessonUpdate = z.infer<typeof LessonUpdateSchema>;
```

---

## Form Component Pattern

### Basic Form with Blur Validation

```tsx
// components/lessons/CreateLessonForm/CreateLessonForm.tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { LessonInputSchema, type LessonInput } from '@/schemas/LessonSchema';
import { createAppError, Errors } from '@/lib/errors';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SuccessNotification } from '@/components/ui/SuccessNotification';

export function CreateLessonForm() {
	const [formData, setFormData] = useState<Partial<LessonInput>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [generalError, setGeneralError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);

	// Validate single field on blur
	async function validateField(
		name: keyof LessonInput,
		value: unknown
	): Promise<string | null> {
		try {
			// Create partial schema for just this field
			const fieldSchema = z.object({
				[name]: LessonInputSchema.shape[name],
			});

			fieldSchema.parse({ [name]: value });
			return null;
		} catch (err) {
			if (err instanceof z.ZodError) {
				return err.errors[0]?.message || 'Invalid input';
			}
			return 'Validation error';
		}
	}

	// Handle blur event
	async function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		const error = await validateField(name as keyof LessonInput, value);

		setErrors((prev) => ({
			...prev,
			[name]: error || undefined,
		}));
	}

	// Handle change event (updates state but doesn't validate)
	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field when user starts typing again
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		}
	}

	// Handle form submission
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setGeneralError(null);
		setIsSubmitting(true);

		try {
			// Validate entire form
			const validated = LessonInputSchema.parse(formData);

			// Submit to API
			const response = await fetch('/api/lessons', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(validated),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create lesson');
			}

			setSuccess(true);
			setFormData({});
			setTimeout(() => setSuccess(false), 3000);

			// Redirect after success
			setTimeout(() => {
				window.location.href = '/lessons';
			}, 1500);
		} catch (err) {
			if (err instanceof z.ZodError) {
				// Multiple field errors
				const fieldErrors = err.flatten().fieldErrors;
				const allErrors: Record<string, string> = {};

				Object.entries(fieldErrors).forEach(([field, messages]) => {
					allErrors[field] = messages?.[0] || 'Invalid input';
				});

				setErrors(allErrors);
				setGeneralError('Please fix the errors above and try again.');
			} else if (err instanceof Error) {
				setGeneralError(err.message);
			} else {
				setGeneralError('An unexpected error occurred. Please try again.');
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			{generalError && (
				<ErrorAlert
					message={generalError}
					onDismiss={() => setGeneralError(null)}
				/>
			)}
			{success && (
				<SuccessNotification message='Lesson created successfully!' />
			)}

			{/* Title Field */}
			<div>
				<label
					htmlFor='title'
					className='block text-sm font-medium text-gray-700 dark:text-gray-300'
				>
					Lesson Title *
				</label>
				<input
					id='title'
					name='title'
					type='text'
					value={formData.title ?? ''}
					onChange={handleChange}
					onBlur={handleBlur}
					aria-required='true'
					aria-invalid={!!errors.title}
					aria-describedby={errors.title ? 'title-error' : undefined}
					className={`mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border rounded-lg shadow-sm transition-all
            ${
							errors.title
								? 'border-red-500 focus:ring-red-500 focus:border-red-500'
								: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
						}
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          `}
					placeholder='Enter lesson title'
				/>
				{errors.title && (
					<p
						id='title-error'
						className='mt-1 text-xs text-red-600 dark:text-red-400'
					>
						{errors.title}
					</p>
				)}
			</div>

			{/* Date Field */}
			<div>
				<label
					htmlFor='date'
					className='block text-sm font-medium text-gray-700 dark:text-gray-300'
				>
					Date *
				</label>
				<input
					id='date'
					name='date'
					type='date'
					value={formData.date ?? ''}
					onChange={handleChange}
					onBlur={handleBlur}
					aria-required='true'
					aria-invalid={!!errors.date}
					aria-describedby={errors.date ? 'date-error' : undefined}
					className={`mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border rounded-lg shadow-sm transition-all
            ${
							errors.date
								? 'border-red-500 focus:ring-red-500 focus:border-red-500'
								: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
						}
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          `}
				/>
				{errors.date && (
					<p
						id='date-error'
						className='mt-1 text-xs text-red-600 dark:text-red-400'
					>
						{errors.date}
					</p>
				)}
			</div>

			{/* Notes Field */}
			<div>
				<label
					htmlFor='notes'
					className='block text-sm font-medium text-gray-700 dark:text-gray-300'
				>
					Notes
				</label>
				<textarea
					id='notes'
					name='notes'
					value={formData.notes ?? ''}
					onChange={handleChange}
					onBlur={handleBlur}
					aria-invalid={!!errors.notes}
					aria-describedby={errors.notes ? 'notes-error' : undefined}
					className={`mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border rounded-lg shadow-sm transition-all
            ${
							errors.notes
								? 'border-red-500 focus:ring-red-500 focus:border-red-500'
								: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
						}
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            resize-none
          `}
					rows={4}
					placeholder='Add any notes about this lesson'
				/>
				{errors.notes && (
					<p
						id='notes-error'
						className='mt-1 text-xs text-red-600 dark:text-red-400'
					>
						{errors.notes}
					</p>
				)}
			</div>

			{/* Submit Button */}
			<div className='flex gap-2 sm:gap-3'>
				<button
					type='submit'
					disabled={isSubmitting}
					className='flex-1 px-4 py-2 sm:py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
				>
					{isSubmitting ? 'Creating...' : 'Create Lesson'}
				</button>
				<button
					type='button'
					onClick={() => setFormData({})}
					className='flex-1 px-4 py-2 sm:py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
				>
					Clear
				</button>
			</div>
		</form>
	);
}
```

---

## Form Input Component (Reusable)

Create focused input components for consistency:

```tsx
// components/ui/FormInput/FormInput.tsx
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
	required?: boolean;
	helperText?: string;
}

export function FormInput({
	label,
	error,
	required,
	helperText,
	name,
	id,
	...props
}: FormInputProps) {
	const inputId = id || name;

	return (
		<div>
			<label
				htmlFor={inputId}
				className='block text-sm font-medium text-gray-700 dark:text-gray-300'
			>
				{label}
				{required && (
					<span className='text-red-600 dark:text-red-400 ml-1'>*</span>
				)}
			</label>

			<input
				id={inputId}
				name={name}
				aria-required={required}
				aria-invalid={!!error}
				aria-describedby={
					error
						? `${inputId}-error`
						: helperText
						? `${inputId}-helper`
						: undefined
				}
				className={`mt-1 w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border rounded-lg shadow-sm transition-all
          ${
						error
							? 'border-red-500 focus:ring-red-500 focus:border-red-500'
							: 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
					}
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2
        `}
				{...props}
			/>

			{error && (
				<p
					id={`${inputId}-error`}
					className='mt-1 text-xs text-red-600 dark:text-red-400'
				>
					{error}
				</p>
			)}

			{helperText && (
				<p
					id={`${inputId}-helper`}
					className='mt-1 text-xs text-gray-500 dark:text-gray-400'
				>
					{helperText}
				</p>
			)}
		</div>
	);
}
```

**Usage**:

```tsx
<FormInput
	label='Email'
	name='email'
	type='email'
	value={formData.email}
	onChange={handleChange}
	onBlur={handleBlur}
	error={errors.email}
	required
	helperText="We'll never share your email"
/>
```

---

## Advanced: Form with useForm Hook

For complex forms, create a custom hook:

```tsx
// hooks/useForm.ts
import { useState } from 'react';
import { z } from 'zod';

export function useForm<T extends Record<string, unknown>>(
	schema: z.ZodSchema,
	onSubmit: (data: T) => Promise<void>
) {
	const [formData, setFormData] = useState<Partial<T>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function validateField(name: string, value: unknown) {
		try {
			const fieldSchema = z.object({
				[name]: schema.shape[name],
			});
			fieldSchema.parse({ [name]: value });
			return null;
		} catch (err) {
			if (err instanceof z.ZodError) {
				return err.errors[0]?.message || 'Invalid input';
			}
			return 'Validation error';
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	}

	async function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		const error = await validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: error || undefined }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const validated = schema.parse(formData);
			await onSubmit(validated as T);
		} catch (err) {
			if (err instanceof z.ZodError) {
				const fieldErrors = err.flatten().fieldErrors;
				const allErrors: Record<string, string> = {};
				Object.entries(fieldErrors).forEach(([field, messages]) => {
					allErrors[field] = messages?.[0] || 'Invalid input';
				});
				setErrors(allErrors);
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return {
		formData,
		errors,
		isSubmitting,
		handleChange,
		handleBlur,
		handleSubmit,
		setFormData,
	};
}
```

**Usage**:

```tsx
const {
	formData,
	errors,
	handleChange,
	handleBlur,
	handleSubmit,
	isSubmitting,
} = useForm(LessonInputSchema, async (data) => {
	await createLesson(data);
});
```

---

## Field Formatting Helpers

```tsx
// helpers/formHelpers.ts

/**
 * Format phone number as user types: (555) 123-4567
 */
export function formatPhoneNumber(value: string): string {
	const digits = value.replace(/\D/g, '');
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
	return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Format currency input
 */
export function formatCurrency(value: string): string {
	const number = parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
	return `$${number.toFixed(2)}`;
}

/**
 * Strip formatting before validation
 */
export function stripFormatting(value: string): string {
	return value.replace(/[^\d.-]/g, '');
}
```

---

## Testing Forms

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateLessonForm } from './CreateLessonForm';

describe('CreateLessonForm', () => {
	it('should show title error on blur if empty', async () => {
		render(<CreateLessonForm />);

		const input = screen.getByLabelText(/Lesson Title/i);
		await userEvent.click(input);
		fireEvent.blur(input);

		await waitFor(() => {
			expect(screen.getByText(/title is required/i)).toBeInTheDocument();
		});
	});

	it('should submit valid form', async () => {
		render(<CreateLessonForm />);

		await userEvent.type(screen.getByLabelText(/Lesson Title/i), 'My Lesson');
		await userEvent.type(screen.getByLabelText(/Date/i), '2025-10-26');

		const submitButton = screen.getByRole('button', { name: /Create Lesson/i });
		await userEvent.click(submitButton);

		await waitFor(() => {
			expect(
				screen.getByText(/Lesson created successfully/i)
			).toBeInTheDocument();
		});
	});
});
```

---

## Common Mistakes & Fixes

### ❌ Mistake 1: Validating on Every Keystroke

Annoying UX, excessive validation calls.

```tsx
// Before: Validates on every key
onChange={async (e) => {
  const error = await validateField(e.target.name, e.target.value);
  setErrors(prev => ({ ...prev, [e.target.name]: error }));
}}

// After: Validate only on blur
onBlur={async (e) => {
  const error = await validateField(e.target.name, e.target.value);
  setErrors(prev => ({ ...prev, [e.target.name]: error }));
}}
```

### ❌ Mistake 2: Showing All Errors at Once

Overwhelms user on first submit.

```tsx
// Before: Show all errors immediately
Object.entries(fieldErrors).forEach(([field, messages]) => {
	showToast(`${field}: ${messages[0]}`); // 5 toasts!
});

// After: Show error summary + inline errors
setErrors(allErrors); // Show inline
setGeneralError('Please fix the errors above');
```

### ❌ Mistake 3: Not Clearing Errors While Typing

User fixes error but sees old message.

```tsx
// Before: Error stays until blur again
handleChange(e) {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
}

// After: Clear error when user types
handleChange(e) {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  if (errors[e.target.name]) {
    setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  }
}
```

---

## Mobile Form Considerations

```tsx
// ✅ DO: Touch-friendly sizes
<input
  className="px-3 sm:px-4 py-2 sm:py-3" // Min 44px height on mobile
/>

// ❌ DON'T: Tiny inputs on mobile
<input className="px-2 py-1" /> // Only 32px high

// ✅ DO: Full-width on mobile
<input className="w-full" />

// ✅ DO: Stack forms vertically on mobile
<div className="space-y-4 sm:space-y-6" />

// ✅ DO: Use appropriate input types
<input type="email" /> // Mobile keyboard
<input type="tel" />   // Numeric keyboard
<input type="date" />  // Date picker
```

---

## Checklist Before Committing

- [ ] Schema defined in `schemas/`
- [ ] Validation on blur (not on every keystroke)
- [ ] Validation on submit (full form check)
- [ ] Zod errors mapped to user-friendly messages
- [ ] Error cleared when user starts typing
- [ ] Field validation results in unit tests
- [ ] Form submission tested end-to-end
- [ ] Mobile input heights ≥ 44px
- [ ] Labels associated with inputs (`htmlFor`)
- [ ] ARIA attributes present (`aria-required`, `aria-invalid`, `aria-describedby`)
- [ ] Dark mode styles included
- [ ] Keyboard navigation works
- [ ] Submit button disabled during submission

---

## Resources

- Zod docs: https://zod.dev
- Form patterns: `.github/component-architecture.instructions.md`
- Accessibility: https://www.w3.org/WAI/tutorials/forms/
