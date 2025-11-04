'use client';

import React from 'react';
import { useSongDetail } from './useSongDetail';
import SongDetailHeader from './Header';
import SongDetailInfo from './Info';
import SongDetailActions from './Actions';
import { useRouter } from 'next/navigation';

interface Props {
	songId: string;
	onDeleted?: () => void;
}

export default function SongDetail({ songId, onDeleted }: Props) {
	const { song, loading, error, deleting, handleDelete } = useSongDetail(
		songId,
		onDeleted
	);
	const router = useRouter();

	if (loading) {
		return <div data-testid='song-detail-loading'>Loading song details...</div>;
	}

	if (error || !song) {
		return <div>{error || 'Song not found'}</div>;
	}

	return (
		<div className='max-w-2xl mx-auto py-6'>
			<button
				onClick={() => router.back()}
				className='mb-4 text-blue-600 hover:underline'
			>
				← Back
			</button>

			<SongDetailHeader title={song.title} author={song.author} />
			<SongDetailInfo song={song} />
			<SongDetailActions
				songId={song.id}
				deleting={deleting}
				onDelete={handleDelete}
			/>
		</div>
	);
}
