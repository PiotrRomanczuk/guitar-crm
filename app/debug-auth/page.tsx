'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

function AuthContextStatus({
	user,
	loading,
	isAdmin,
	isTeacher,
	isStudent,
}: ReturnType<typeof useAuth>) {
	return (
		<div className='bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-lg'>
			<h2 className='text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white'>
				Auth Context Status
			</h2>
			<pre className='text-xs sm:text-sm overflow-auto text-gray-800 dark:text-gray-200'>
				{JSON.stringify(
					{
						hasUser: !!user,
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
	);
}

function UserObjectDisplay({
	user,
}: {
	user: ReturnType<typeof useAuth>['user'];
}) {
	if (!user) return null;

	return (
		<div className='bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-lg'>
			<h2 className='text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white'>
				User Object
			</h2>
			<pre className='text-xs sm:text-sm overflow-auto text-gray-800 dark:text-gray-200'>
				{JSON.stringify(
					{
						id: user.id,
					},
					null,
					2
				)}
			</pre>
		</div>
	);
}

function ProfileDataDisplay({
	profileData,
	profileError,
}: {
	profileData: Record<string, unknown> | null;
	profileError: string | null;
}) {
	return (
		<div className='bg-green-100 dark:bg-green-900 p-3 sm:p-4 rounded-lg'>
			<h2 className='text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white'>
				Profile Table Data
			</h2>
			{profileError ? (
				<div className='text-red-600 text-xs sm:text-sm'>
					<strong>Error:</strong> {profileError}
				</div>
			) : profileData ? (
				<pre className='text-xs sm:text-sm overflow-auto'>
					{JSON.stringify(profileData, null, 2)}
				</pre>
			) : (
				<div className='text-xs sm:text-sm text-gray-600'>
					Loading profile...
				</div>
			)}
		</div>
	);
}

function AdminAccessDisplay({ isAdmin }: { isAdmin: boolean }) {
	return (
		<div className='bg-yellow-100 p-3 sm:p-4 rounded-lg'>
			<h2 className='text-base sm:text-lg font-semibold mb-2'>
				Expected Admin Access
			</h2>
			<div className='space-y-2'>
				<div
					className={`p-2 rounded text-xs sm:text-sm ${
						isAdmin ? 'bg-green-200' : 'bg-red-200'
					}`}
				>
					Admin Access: {isAdmin ? '✅ GRANTED' : '❌ DENIED'}
				</div>
				<div className='text-xs sm:text-sm text-gray-600'>
					<strong>Why:</strong>{' '}
					{isAdmin
						? 'User has admin privileges'
						: 'User does not have admin privileges - check profile table or user_metadata'}
				</div>
			</div>
		</div>
	);
}

export default function DebugAuthPage() {
	const authContext = useAuth();
	const { user } = authContext;
	const [profileData, setProfileData] = useState<Record<
		string,
		unknown
	> | null>(null);
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

	if (authContext.loading) {
		return <div className='p-3 sm:p-8'>Loading...</div>;
	}

	return (
		<div className='p-3 sm:p-8 max-w-4xl mx-auto'>
			<h1 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white'>
				🐛 Authentication Debug
			</h1>

			<div className='space-y-3 sm:space-y-6'>
				<AuthContextStatus {...authContext} />
				<UserObjectDisplay user={user} />
				<ProfileDataDisplay
					profileData={profileData}
					profileError={profileError}
				/>
				<AdminAccessDisplay isAdmin={authContext.isAdmin} />
			</div>
		</div>
	);
}
