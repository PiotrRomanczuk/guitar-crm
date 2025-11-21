'use client';

import React, { useState, FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { SignUpSchema } from '@/schemas/AuthSchema';
import { extractFieldErrors, validateField } from '@/lib/form-validation';

interface TouchedFields {
	email: boolean;
	password: boolean;
	firstName: boolean;
	lastName: boolean;
}

interface SignUpResponse {
	data: { user: { identities?: unknown[] } | null };
	error: { message: string } | null;
}

async function signUpUser(
	email: string,
	password: string,
	firstName: string,
	lastName: string
): Promise<SignUpResponse> {
	const supabase = getSupabaseBrowserClient();
	return await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				first_name: firstName,
				last_name: lastName,
			},
		},
	});
}

function checkIfEmailExists(user: { identities?: unknown[] } | null): boolean {
	return (user?.identities?.length ?? 0) === 0;
}

export function useSignUpLogic(onSuccess?: () => void) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<TouchedFields>({
		email: false,
		password: false,
		firstName: false,
		lastName: false,
	});

	// Real-time validation for touched fields using Zod
	const validateTouchedFields = () => {
		const errors: Record<string, string> = {};
		
		if (touched.firstName) {
			const error = validateField(SignUpSchema, 'firstName', firstName);
			if (error) errors.firstName = error;
		}
		
		if (touched.lastName) {
			const error = validateField(SignUpSchema, 'lastName', lastName);
			if (error) errors.lastName = error;
		}
		
		if (touched.email) {
			const error = validateField(SignUpSchema, 'email', email);
			if (error) errors.email = error;
		}
		
		if (touched.password) {
			const error = validateField(SignUpSchema, 'password', password);
			if (error) errors.password = error;
		}
		
		setFieldErrors(errors);
	};

	// Call validation whenever touched fields change
	React.useEffect(() => {
		if (touched.firstName || touched.lastName || touched.email || touched.password) {
			validateTouchedFields();
		}
	}, [firstName, lastName, email, password, touched.firstName, touched.lastName, touched.email, touched.password]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Mark all fields as touched
		const newTouched = {
			email: true,
			password: true,
			firstName: true,
			lastName: true,
		};
		setTouched(newTouched);

		// Validate all fields with Zod schema
		const result = SignUpSchema.safeParse({ firstName, lastName, email, password });
		
		if (!result.success) {
			const errors = extractFieldErrors(result.error);
			setFieldErrors(errors);
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);
		setFieldErrors({});

		const response = await signUpUser(
			result.data.email,
			result.data.password,
			result.data.firstName,
			result.data.lastName
		);

		setLoading(false);
		if (response.error) {
			setError(response.error.message);
			return;
		}

		if (response.data.user && checkIfEmailExists(response.data.user)) {
			setError('This email is already registered. Please sign in instead.');
			return;
		}

		if (response.data.user) {
			setSuccess(true);
			if (onSuccess) onSuccess();
		}
	};

	// Get first validation error for display
	const validationError = Object.values(fieldErrors)[0] || null;

	return {
		email,
		setEmail,
		password,
		setPassword,
		firstName,
		setFirstName,
		lastName,
		setLastName,
		loading,
		error,
		success,
		touched,
		setTouched,
		validationError,
		fieldErrors,
		handleSubmit,
	};
}
