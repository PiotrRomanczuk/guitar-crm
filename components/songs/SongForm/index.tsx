'use client';

import React from 'react';
import SongFormContent from './Content';
import { Song } from '@/schemas/SongSchema';

interface Props {
	mode: 'create' | 'edit';
	song?: Song;
	onSuccess?: () => void;
}

export default function SongForm({ mode, song, onSuccess }: Props) {
	return (
		<div className='max-w-2xl mx-auto py-6'>
			<h1 className='text-3xl font-bold mb-6'>
				{mode === 'create' ? 'Create New Song' : 'Edit Song'}
			</h1>
			<SongFormContent mode={mode} song={song} onSuccess={onSuccess} />
		</div>
	);
}
