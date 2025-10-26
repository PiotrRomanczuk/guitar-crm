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
		<form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
			<p className='text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center'>
				Enter your email and we&apos;ll send you a reset link
			</p>

			<div className='space-y-1 sm:space-y-2'>
				<label
					htmlFor='email'
					className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
				>
					Email
				</label>
				<input
					id='email'
					name='email'
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onBlur={() => setTouched(true)}
					required
					className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>

			{validationError && (
				<div
					role='alert'
					className='p-2 sm:p-3 text-xs sm:text-sm bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800'
				>
					{validationError}
				</div>
			)}
			{error && (
				<div
					role='alert'
					className='p-2 sm:p-3 text-xs sm:text-sm bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800'
				>
					{error}
				</div>
			)}

			{success && (
				<div
					role='status'
					className='p-2 sm:p-3 text-xs sm:text-sm bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-800'
				>
					Check your email for the reset link
				</div>
			)}

			<button
				type='submit'
				disabled={loading}
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
			>
				{loading ? 'Sending...' : 'Send Reset Link'}
			</button>

			<p className='text-center text-xs sm:text-sm'>
				<a
					href='/sign-in'
					className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
				>
					Back to sign in
				</a>
			</p>
		</form>
	);
}
