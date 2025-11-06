import { z } from 'zod';

export interface ValidationError {
	field: string;
	message: string;
}

export interface ZodIssue {
	path: (string | number)[];
	message: string;
}

export const extractValidationErrors = (
	error: z.ZodError
): Record<string, string> => {
	const validationErrors: Record<string, string> = {};
	error.issues.forEach((issue: ZodIssue) => {
		validationErrors[issue.path[0] as string] = issue.message;
	});
	return validationErrors;
};

export const createUserValidationSchema = () => {
	return UserInputSchema.extend({
		firstName: z.string().min(1, 'First name is required'),
		lastName: z.string().min(1, 'Last name is required'),
		email: z.string().email('Valid email is required'),
	});
};

// Import the schema types
import { UserInputSchema } from '@/schemas/UserSchema';
