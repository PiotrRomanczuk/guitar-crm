'use client';

import React from 'react';
import { useSongList } from '../hooks';
import SongListHeader from './Header';
import SongListTable from './Table';
import SongListEmpty from './Empty';
import SongListFilter from './Filter';

export default function SongList() {
	const { songs, loading, error, filters, setFilters } = useSongList();

	if (loading) {
		return <div data-testid='song-list-loading'>Loading songs...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<SongListHeader />
			<SongListFilter filters={filters} onChange={setFilters} />
			{songs.length === 0 ? <SongListEmpty /> : <SongListTable songs={songs} />}
		</div>
	);
}
