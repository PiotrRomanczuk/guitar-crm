'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface SignUpFormProps {
	onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [touched, setTouched] = useState({
		email: false,
		password: false,
		firstName: false,
		lastName: false,
	});

	const validate = () => {
		if (touched.firstName && !firstName) return 'First name is required';
		if (touched.lastName && !lastName) return 'Last name is required';
		if (touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			return 'Invalid email';
		if (touched.password && password && password.length < 6)
			return 'Password must be at least 6 characters';
		return null;
	};

	const validationError = validate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Mark all fields as touched
		setTouched({
			email: true,
			password: true,
			firstName: true,
			lastName: true,
		});

		// Validate before submission
		if (!firstName || !lastName || !email || password.length < 6) {
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		const { data, error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					first_name: firstName,
					last_name: lastName,
				},
			},
		});

		setLoading(false);

		if (signUpError) {
			setError(signUpError.message);
			return;
		}

		// Check if user already exists - Supabase returns user with empty identities array
		if (
			data.user &&
			(!data.user.identities || data.user.identities.length === 0)
		) {
			setError('This email is already registered. Please sign in instead.');
			return;
		}

		if (data.user) {
			setSuccess(true);
			if (onSuccess) {
				onSuccess();
			}
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor='firstName'>First Name</label>
				<input
					id='firstName'
					name='firstName'
					type='text'
					value={firstName}
					onChange={(e) => setFirstName(e.target.value)}
					onBlur={() => setTouched({ ...touched, firstName: true })}
					required
				/>
			</div>

			<div>
				<label htmlFor='lastName'>Last Name</label>
				<input
					id='lastName'
					name='lastName'
					type='text'
					value={lastName}
					onChange={(e) => setLastName(e.target.value)}
					onBlur={() => setTouched({ ...touched, lastName: true })}
					required
				/>
			</div>

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
					type='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onBlur={() => setTouched({ ...touched, password: true })}
					required
					minLength={6}
				/>
				<small>Minimum 6 characters</small>
			</div>

			{validationError && <div role='alert'>{validationError}</div>}
			{error && <div role='alert'>{error}</div>}

			{success && <div role='status'>Check your email for confirmation</div>}

			<button type='submit' disabled={loading}>
				{loading ? 'Signing up...' : 'Sign Up'}
			</button>

			<p>
				Already have an account? <a href='/sign-in'>Sign in</a>
			</p>
		</form>
	);
}
