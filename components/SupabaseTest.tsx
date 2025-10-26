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

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

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
