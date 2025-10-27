'use client';

import React from 'react';
import { RequireTeacher } from '@/components/auth/RequireRole';
import SongForm from './SongForm';
import { Song } from '@/schemas/SongSchema';

interface Props {
	mode: 'create' | 'edit';
	song?: Song;
	onSuccess?: () => void;
}

export default function SongFormGuard({ mode, song, onSuccess }: Props) {
	return (
		<RequireTeacher
			loadingComponent={
				<div className='min-h-screen flex items-center justify-center'>
					<div className='text-xl text-gray-600'>Loading...</div>
				</div>
			}
		>
			<SongForm mode={mode} song={song} onSuccess={onSuccess} />
		</RequireTeacher>
	);
}
