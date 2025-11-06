'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SongListHeader() {
	const { isTeacher, isAdmin } = useAuth();
	const canManageSongs = isTeacher || isAdmin;

	return (
		<div className='flex items-center justify-between py-4'>
			<h2 className='text-2xl font-bold'>Song Library</h2>
			{canManageSongs && (
				<Link href='/songs/new'>
					<button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
						Create new song
					</button>
				</Link>
			)}
		</div>
	);
}
