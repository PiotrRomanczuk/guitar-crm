'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface SignInFormProps {
	onSuccess?: () => void;
}

function EmailInput({
	value,
	onChange,
	onBlur,
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur: () => void;
}) {
	return (
		<div className='space-y-1 sm:space-y-2'>
			<label
				htmlFor='email'
				className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
			>
				Email Address
			</label>
			<input
				id='email'
				name='email'
				type='email'
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				required
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500'
			/>
		</div>
	);
}

function PasswordInput({
	value,
	onChange,
	onBlur,
	showPassword,
	onToggleShow,
}: {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur: () => void;
	showPassword: boolean;
	onToggleShow: () => void;
}) {
	return (
		<div className='space-y-1 sm:space-y-2'>
			<label
				htmlFor='password'
				className='block text-xs sm:text-sm font-medium text-gray-900 dark:text-white'
			>
				Password
			</label>
			<div className='relative'>
				<input
					id='password'
					name='password'
					type={showPassword ? 'text' : 'password'}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					required
					className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg dark:hover:border-gray-500'
				/>
				<button
					type='button'
					onClick={onToggleShow}
					className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
				>
					{showPassword ? 'Hide' : 'Show'}
				</button>
			</div>
		</div>
	);
}

function AlertMessage({
	message,
	type = 'error',
}: {
	message: string;
	type?: 'error' | 'success';
}) {
	return (
		<div
			role='alert'
			className={`p-2 sm:p-3 text-xs sm:text-sm rounded-lg border ${
				type === 'error'
					? 'bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 border-red-200 dark:border-red-800'
					: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 border-green-200 dark:border-green-800'
			}`}
		>
			{message}
		</div>
	);
}

function SignInFooter() {
	return (
		<div className='space-y-2 text-xs sm:text-sm'>
			<p className='text-center'>
				<a
					href='/forgot-password'
					className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
				>
					Forgot password?
				</a>
			</p>

			<p className='text-center text-gray-600 dark:text-gray-400'>
				Don&apos;t have an account?{' '}
				<a
					href='/sign-up'
					className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
				>
					Sign up
				</a>
			</p>
		</div>
	);
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [touched, setTouched] = useState({
		email: false,
		password: false,
	});

	const validate = () => {
		if (touched.email && !email) return 'Email is required';
		if (touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return 'Invalid email';
		if (touched.password && !password) return 'Password is required';
		return null;
	};

	const validationError = validate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setTouched({
			email: true,
			password: true,
		});

		if (!email || !password) {
			return;
		}

		setLoading(true);
		setError(null);

		const { data, error: signInError } = await supabase.auth.signInWithPassword(
			{
				email,
				password,
			}
		);

		setLoading(false);

		if (signInError) {
			setError(signInError.message);
			return;
		}

		if (data.user) {
			setEmail('');
			setPassword('');
			if (onSuccess) {
				onSuccess();
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
			<EmailInput
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				onBlur={() => setTouched({ ...touched, email: true })}
			/>

			<PasswordInput
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				onBlur={() => setTouched({ ...touched, password: true })}
				showPassword={showPassword}
				onToggleShow={() => setShowPassword((v) => !v)}
			/>

			{validationError && <AlertMessage message={validationError} />}
			{error && <AlertMessage message={error} />}

			<button
				type='submit'
				disabled={loading}
				className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>

			<SignInFooter />
		</form>
	);
}
