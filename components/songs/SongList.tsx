'use client';

import React from 'react';
import useSongList from './useSongList';
import SongListHeader from './SongList.Header';
import SongListTable from './SongList.Table';
import SongListEmpty from './SongList.Empty';
import SongListFilter from './SongList.Filter';

export default function SongList() {
	const { songs, loading, error, filterLevel, setFilterLevel } = useSongList();

	if (loading) {
		return <div data-testid='song-list-loading'>Loading songs...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<SongListHeader />
			<SongListFilter
				filterLevel={filterLevel}
				onFilterChange={setFilterLevel}
			/>
			{songs.length === 0 ? <SongListEmpty /> : <SongListTable songs={songs} />}
		</div>
	);
}
