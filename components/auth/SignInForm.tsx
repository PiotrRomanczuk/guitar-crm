'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface SignInFormProps {
	onSuccess?: () => void;
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

		// Mark all fields as touched
		setTouched({
			email: true,
			password: true,
		});

		// Validate before submission
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
			// Clear form on success
			setEmail('');
			setPassword('');
			if (onSuccess) {
				onSuccess();
			}
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor='email'>Email</label>
				<input
					id='email'
					name='email'
					type='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onBlur={() => setTouched({ ...touched, email: true })}
					required
				/>
			</div>

			<div>
				<label htmlFor='password'>Password</label>
				<input
					id='password'
					name='password'
					type={showPassword ? 'text' : 'password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onBlur={() => setTouched({ ...touched, password: true })}
					required
				/>
				<button type='button' onClick={() => setShowPassword((v) => !v)}>
					{showPassword ? 'Hide password' : 'Show password'}
				</button>
			</div>

			{validationError && <div role='alert'>{validationError}</div>}
			{error && <div role='alert'>{error}</div>}

			<button type='submit' disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>

			<p>
				<a href='/forgot-password'>Forgot password?</a>
			</p>

			<p>
				Don&apos;t have an account? <a href='/sign-up'>Sign up</a>
			</p>
		</form>
	);
}
