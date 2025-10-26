'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function DebugAuthPage() {
	const { user, session, loading, isAdmin, isTeacher, isStudent } = useAuth();
	const [profileData, setProfileData] = useState<any>(null);
	const [profileError, setProfileError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			if (!user?.id) return;

			try {
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('user_id', user.id)
					.single();

				if (error) {
					setProfileError(error.message);
				} else {
					setProfileData(data);
				}
			} catch (err) {
				setProfileError(err instanceof Error ? err.message : 'Unknown error');
			}
		};

		fetchProfile();
	}, [user?.id]);

	if (loading) {
		return <div className='p-8'>Loading...</div>;
	}

	return (
		<div className='p-8 max-w-4xl mx-auto'>
			<h1 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
				🐛 Authentication Debug
			</h1>

			<div className='space-y-6'>
				<div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-lg'>
					<h2 className='text-lg font-semibold mb-2 text-gray-900 dark:text-white'>
						Auth Context Status
					</h2>
					<pre className='text-sm overflow-auto text-gray-800 dark:text-gray-200'>
						{JSON.stringify(
							{
								hasUser: !!user,
								hasSession: !!session,
								loading,
								isAdmin,
								isTeacher,
								isStudent,
							},
							null,
							2
						)}
					</pre>
				</div>

				{user && (
					<div className='bg-blue-100 dark:bg-blue-900 p-4 rounded-lg'>
						<h2 className='text-lg font-semibold mb-2 text-gray-900 dark:text-white'>
							User Object
						</h2>
						<pre className='text-sm overflow-auto text-gray-800 dark:text-gray-200'>
							{JSON.stringify(
								{
									id: user.id,
									email: user.email,
									user_metadata: user.user_metadata,
									app_metadata: user.app_metadata,
								},
								null,
								2
							)}
						</pre>
					</div>
				)}

				<div className='bg-green-100 dark:bg-green-900 p-4 rounded-lg'>
					<h2 className='text-lg font-semibold mb-2 text-gray-900 dark:text-white'>
						Profile Table Data
					</h2>
					{profileError ? (
						<div className='text-red-600'>
							<strong>Error:</strong> {profileError}
						</div>
					) : profileData ? (
						<pre className='text-sm overflow-auto'>
							{JSON.stringify(profileData, null, 2)}
						</pre>
					) : (
						<div className='text-gray-600'>Loading profile...</div>
					)}
				</div>

				<div className='bg-yellow-100 p-4 rounded-lg'>
					<h2 className='text-lg font-semibold mb-2'>Expected Admin Access</h2>
					<div className='space-y-2'>
						<div
							className={`p-2 rounded ${
								isAdmin ? 'bg-green-200' : 'bg-red-200'
							}`}
						>
							Admin Access: {isAdmin ? '✅ GRANTED' : '❌ DENIED'}
						</div>
						<div className='text-sm text-gray-600'>
							<strong>Why:</strong>{' '}
							{isAdmin
								? 'User has admin privileges'
								: 'User does not have admin privileges - check profile table or user_metadata'}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
