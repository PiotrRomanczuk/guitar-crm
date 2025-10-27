'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

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

function getValidationError(
	touched: TouchedFields,
	email: string,
	password: string,
	firstName: string,
	lastName: string
): string | null {
	if (touched.firstName && !firstName) return 'First name is required';
	if (touched.lastName && !lastName) return 'Last name is required';
	if (touched.email && email && !isValidEmail(email)) return 'Invalid email';
	if (touched.password && password && password.length < 6)
		return 'Password must be at least 6 characters';
	return null;
}

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function signUpUser(
	email: string,
	password: string,
	firstName: string,
	lastName: string
): Promise<SignUpResponse> {
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

function validateAndProcessSignUp(
	firstName: string,
	lastName: string,
	email: string,
	password: string
): boolean {
	if (!firstName || !lastName || !email || password.length < 6) {
		return false;
	}
	return true;
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
	const [touched, setTouched] = useState<TouchedFields>({
		email: false,
		password: false,
		firstName: false,
		lastName: false,
	});

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const newTouched = {
			email: true,
			password: true,
			firstName: true,
			lastName: true,
		};
		setTouched(newTouched);

		if (!validateAndProcessSignUp(firstName, lastName, email, password)) {
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		const response = await signUpUser(email, password, firstName, lastName);

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

	const validationError = getValidationError(
		touched,
		email,
		password,
		firstName,
		lastName
	);

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
		handleSubmit,
	};
}
