'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export default function SupabaseTest() {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProfiles() {
			// Check if Supabase is properly configured
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

			if (
				!supabaseUrl ||
				!supabaseAnonKey ||
				supabaseUrl.includes('placeholder')
			) {
				setError(
					'Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
				);
				setLoading(false);
				return;
			}

			try {
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.limit(5);

				if (error) {
					setError(error.message);
				} else {
					setProfiles(data || []);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
			} finally {
				setLoading(false);
			}
		}

		fetchProfiles();
	}, []);

	if (loading)
		return (
			<div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600 dark:text-gray-300'>
						Loading Supabase connection...
					</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className='p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
				<h2 className='text-2xl font-bold mb-4 text-red-800 dark:text-red-200'>
					Supabase Connection Status
				</h2>
				<div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4'>
					<p className='text-yellow-800 dark:text-yellow-200 font-semibold'>
						⚠️ Configuration Required
					</p>
					<p className='text-yellow-700 dark:text-yellow-300 mt-2'>{error}</p>
				</div>
				<div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
					<p className='text-blue-800 dark:text-blue-200 font-semibold'>
						Next Steps:
					</p>
					<ol className='list-decimal list-inside mt-2 text-blue-700 dark:text-blue-300 space-y-1'>
						<li>
							Create a Supabase project at{' '}
							<a href='https://supabase.com' className='underline'>
								supabase.com
							</a>
						</li>
						<li>
							Go to Vercel Dashboard → Project Settings → Environment Variables
						</li>
						<li>Add your Supabase URL and Anon Key</li>
						<li>Redeploy the application</li>
					</ol>
				</div>
			</div>
		);

	return (
		<div className='p-6'>
			<h2 className='text-2xl font-bold mb-4'>Supabase Connection Test</h2>
			<p className='mb-4'>✅ Connected to Supabase successfully!</p>
			<p className='mb-4'>Found {profiles.length} profiles:</p>
			<ul className='space-y-2'>
				{profiles.map((profile) => (
					<li key={profile.id} className='p-2 border rounded'>
						{profile.firstName} {profile.lastName} ({profile.email})
						{profile.isAdmin && (
							<span className='text-blue-600 ml-2'>[Admin]</span>
						)}
						{profile.isTeacher && (
							<span className='text-green-600 ml-2'>[Teacher]</span>
						)}
						{profile.isStudent && (
							<span className='text-yellow-600 ml-2'>[Student]</span>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
