'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface ForgotPasswordFormProps {
	onSuccess?: () => void;
}

export default function ForgotPasswordForm({
	onSuccess,
}: ForgotPasswordFormProps) {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [touched, setTouched] = useState(false);

	const validate = () => {
		if (touched && !email) return 'Email is required';
		if (touched && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return 'Invalid email';
		return null;
	};

	const validationError = validate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setTouched(true);

		// Validate before submission
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		const { error: resetError } = await supabase.auth.resetPasswordForEmail(
			email,
			{
				redirectTo: `${window.location.origin}/reset-password`,
			}
		);

		setLoading(false);

		if (resetError) {
			setError(resetError.message);
			return;
		}

		setSuccess(true);
		if (onSuccess) {
			onSuccess();
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<p>Enter your email and we&apos;ll send you a reset link</p>

			<div>
				<label htmlFor='email'>Email</label>
				<input
					id='email'
					name='email'
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onBlur={() => setTouched(true)}
					required
				/>
			</div>

			{validationError && <div role='alert'>{validationError}</div>}
			{error && <div role='alert'>{error}</div>}

			{success && <div role='status'>Check your email for the reset link</div>}

			<button type='submit' disabled={loading}>
				{loading ? 'Sending...' : 'Send Reset Link'}
			</button>

			<p>
				<a href='/sign-in'>Back to sign in</a>
			</p>
		</form>
	);
}
