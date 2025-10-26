'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInForm, useAuth } from '@/components/auth';

export default function SignInPage() {
	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			router.push('/');
		}
	}, [user, router]);

	const handleSuccess = () => {
		router.push('/');
	};

	if (user) {
		return null;
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4'>
			<div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8'>
				<div className='text-center mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
						🎸 Guitar CRM
					</h1>
					<p className='text-gray-600 dark:text-gray-300'>
						Sign in to your account
					</p>
				</div>
				<SignInForm onSuccess={handleSuccess} />
			</div>
		</div>
	);
}
