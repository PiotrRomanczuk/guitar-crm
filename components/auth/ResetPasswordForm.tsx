'use client';

import { useState, FormEvent } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
	onSuccess?: () => void;
}

export default function ResetPasswordForm({
	onSuccess,
}: ResetPasswordFormProps) {
	const router = useRouter();
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

		const supabase = getSupabaseBrowserClient();
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
		} else {
			// Default behavior: redirect to dashboard after a short delay
			setTimeout(() => {
				router.push('/dashboard');
			}, 2000);
		}
	};

	if (success) {
		return (
			<div className="rounded-md bg-green-50 p-4">
				<div className="flex">
					<div className="flex-shrink-0">
						<CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
					</div>
					<div className="ml-3">
						<h3 className="text-sm font-medium text-green-800">
							Password reset successfully
						</h3>
						<div className="mt-2 text-sm text-green-700">
							<p>Redirecting to dashboard...</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<label htmlFor='newPassword' className="block text-sm font-medium text-gray-700">
					New Password
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id='newPassword'
						name='newPassword'
						type={showNewPassword ? 'text' : 'password'}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						onBlur={() => setTouched({ ...touched, newPassword: true })}
						required
						minLength={6}
						className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2"
						placeholder="••••••••"
					/>
					<button
						type='button'
						onClick={() => setShowNewPassword(!showNewPassword)}
						className="absolute inset-y-0 right-0 pr-3 flex items-center"
						aria-label={showNewPassword ? 'Hide password' : 'Show password'}
					>
						{showNewPassword ? (
							<EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
						) : (
							<Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
						)}
					</button>
				</div>
				<p className="mt-2 text-xs text-gray-500">Minimum 6 characters</p>
			</div>

			<div>
				<label htmlFor='confirmPassword' className="block text-sm font-medium text-gray-700">
					Confirm Password
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
					</div>
					<input
						id='confirmPassword'
						name='confirmPassword'
						type={showConfirmPassword ? 'text' : 'password'}
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						onBlur={() => setTouched({ ...touched, confirmPassword: true })}
						required
						minLength={6}
						className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2"
						placeholder="••••••••"
					/>
					<button
						type='button'
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className="absolute inset-y-0 right-0 pr-3 flex items-center"
						aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
					>
						{showConfirmPassword ? (
							<EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
						) : (
							<Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
						)}
					</button>
				</div>
			</div>

			{validationError && (
				<div className="rounded-md bg-red-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">
								{validationError}
							</h3>
						</div>
					</div>
				</div>
			)}

			{error && (
				<div className="rounded-md bg-red-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-red-800">
								{error}
							</h3>
						</div>
					</div>
				</div>
			)}

			<button
				type='submit'
				disabled={loading}
				className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{loading ? 'Resetting...' : 'Reset Password'}
			</button>
		</form>
	);
}
