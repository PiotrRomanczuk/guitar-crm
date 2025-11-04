'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

interface Props {
	songId: string;
	deleting: boolean;
	onDelete: () => void;
}

export default function SongDetailActions({
	songId,
	deleting,
	onDelete,
}: Props) {
	const { isTeacher, isAdmin } = useAuth();
	const canManageSongs = isTeacher || isAdmin;

	if (!canManageSongs) {
		return null;
	}

	return (
		<div className='flex gap-4'>
			<Link href={`/songs/${songId}/edit`}>
				<button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
					Edit song
				</button>
			</Link>
			<button
				onClick={onDelete}
				disabled={deleting}
				className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400'
			>
				{deleting ? 'Deleting...' : 'Delete song'}
			</button>
		</div>
	);
}
