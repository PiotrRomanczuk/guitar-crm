'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface ResetPasswordFormProps {
	onSuccess?: () => void;
}

export default function ResetPasswordForm({
	onSuccess,
}: ResetPasswordFormProps) {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [touched, setTouched] = useState({
		newPassword: false,
		confirmPassword: false,
	});

	const validate = () => {
		if (touched.newPassword && !newPassword) return 'Password is required';
		if (touched.confirmPassword && !confirmPassword)
			return 'Please confirm your password';
		if (touched.newPassword && newPassword && newPassword.length < 6)
			return 'Password must be at least 6 characters';
		return null;
	};

	const validationError = validate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		// Mark all fields as touched
		setTouched({
			newPassword: true,
			confirmPassword: true,
		});

		// Validate before submission
		if (!newPassword || !confirmPassword) {
			return;
		}

		setLoading(true);
		setError(null);
		setSuccess(false);

		// Validate passwords match
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		// Validate minimum length
		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters');
			setLoading(false);
			return;
		}

		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword,
		});

		setLoading(false);

		if (updateError) {
			setError(updateError.message);
			return;
		}

		setSuccess(true);
		if (onSuccess) {
			onSuccess();
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label htmlFor='newPassword'>New Password</label>
				<div>
					<input
						id='newPassword'
						name='newPassword'
						type={showNewPassword ? 'text' : 'password'}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						onBlur={() => setTouched({ ...touched, newPassword: true })}
						required
						minLength={6}
					/>
					<button
						type='button'
						onClick={() => setShowNewPassword(!showNewPassword)}
						aria-label={showNewPassword ? 'Hide password' : 'Show password'}
					>
						{showNewPassword ? 'Hide' : 'Show'}
					</button>
				</div>
				<small>Minimum 6 characters</small>
			</div>

			<div>
				<label htmlFor='confirmPassword'>Confirm Password</label>
				<div>
					<input
						id='confirmPassword'
						name='confirmPassword'
						type={showConfirmPassword ? 'text' : 'password'}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						onBlur={() => setTouched({ ...touched, confirmPassword: true })}
						required
						minLength={6}
					/>
					<button
						type='button'
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
					>
						{showConfirmPassword ? 'Hide' : 'Show'}
					</button>
				</div>
			</div>

			{validationError && <div role='alert'>{validationError}</div>}
			{error && <div role='alert'>{error}</div>}

			{success && <div role='status'>Password reset successfully</div>}

			<button type='submit' disabled={loading}>
				{loading ? 'Resetting...' : 'Reset Password'}
			</button>
		</form>
	);
}
