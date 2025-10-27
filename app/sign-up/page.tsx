'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm, useAuth } from '@/components/auth';

export default function SignUpPage() {
	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (user) {
			router.push('/');
		}
	}, [user, router]);

	const handleSuccess = () => {
		// User needs to verify email before they can sign in
		// Show success message and let them see it
		setTimeout(() => {
			router.push('/sign-in');
		}, 3000);
	};

	if (user) {
		return null;
	}

	return (
		<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8'>
			<div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8'>
				<div className='text-center mb-6 sm:mb-8'>
					<h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
						🎸 Guitar CRM
					</h1>
					<p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
						Create your account
					</p>
				</div>
				<SignUpForm onSuccess={handleSuccess} />
			</div>
		</div>
	);
}
