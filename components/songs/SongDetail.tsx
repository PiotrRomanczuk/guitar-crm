'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase, Tables } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

type Song = Tables<'songs'>;

interface Props {
	songId: string;
	onDeleted?: () => void;
}

export default function SongDetail({ songId, onDeleted }: Props) {
	const [song, setSong] = useState<Song | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();
	const { isTeacher, isAdmin } = useAuth();
	const canManageSongs = isTeacher || isAdmin;

	const loadSong = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('songs')
				.select('*')
				.eq('id', songId);

			if (fetchError || !data || data.length === 0) {
				setError('Song not found');
				return;
			}

			setSong(data[0]);
		} catch {
			setError('Failed to load song');
		} finally {
			setLoading(false);
		}
	}, [songId]);

	useEffect(() => {
		loadSong();
	}, [loadSong]);

	const handleDelete = async () => {
		if (
			!song ||
			!window.confirm('Are you sure you want to delete this song?')
		) {
			return;
		}

		setDeleting(true);

		try {
			const { error: deleteError } = await supabase
				.from('songs')
				.delete()
				.eq('id', song.id);

			if (deleteError) {
				setError('Failed to delete song');
				return;
			}

			onDeleted?.();
			router.push('/songs');
		} catch {
			setError('Failed to delete song');
		} finally {
			setDeleting(false);
		}
	};

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

			<h1 className='text-3xl font-bold mb-2'>{song.title}</h1>
			<p className='text-xl text-gray-600 mb-6'>{song.author}</p>

			<div className='grid grid-cols-2 gap-4 mb-6'>
				<div className='p-4 bg-gray-50 rounded'>
					<p className='font-medium text-gray-600'>Level</p>
					<p className='text-lg'>{song.level}</p>
				</div>
				<div className='p-4 bg-gray-50 rounded'>
					<p className='font-medium text-gray-600'>Key</p>
					<p className='text-lg'>{song.key}</p>
				</div>
			</div>

			{song.chords && (
				<div className='mb-6 p-4 bg-blue-50 rounded'>
					<p className='font-medium mb-2'>Chords</p>
					<p className='font-mono'>{song.chords}</p>
				</div>
			)}

			<div className='mb-6'>
				<a
					href={song.ultimate_guitar_link || '#'}
					target='_blank'
					rel='noopener noreferrer'
					className='text-blue-600 hover:underline'
				>
					View on Ultimate Guitar
				</a>
			</div>

			{canManageSongs && (
				<div className='flex gap-4'>
					<Link href={`/songs/${song.id}/edit`}>
						<button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
							Edit song
						</button>
					</Link>
					<button
						onClick={handleDelete}
						disabled={deleting}
						className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400'
					>
						{deleting ? 'Deleting...' : 'Delete song'}
					</button>
				</div>
			)}
		</div>
	);
}
