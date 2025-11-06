import Link from 'next/link';

import { createClient } from '@/lib/supabase/client';

export async function LandingHeader() {
	// SSR: fetch user from Supabase using server headers

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<header className='text-center mb-8 sm:mb-12'>
			<h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white'>
				🎸 Guitar CRM
			</h1>
			<p className='text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-2'>
				Student Management System
			</p>
			<p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8'>
				Built with Next.js, TypeScript & Supabase
			</p>
			{user ? (
				<div className='mb-4'>
					<span className='text-green-700 dark:text-green-300 font-semibold'>
						Welcome, {user.email || 'User'}!
					</span>
				</div>
			) : (
				<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
					<Link
						href='/sign-in'
						className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base'
					>
						Sign In
					</Link>
					<Link
						href='/sign-up'
						className='bg-white hover:bg-gray-50 text-blue-600 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-blue-600 transition-colors text-sm sm:text-base'
					>
						Sign Up
					</Link>
				</div>
			)}
		</header>
	);
}

export default LandingHeader;
