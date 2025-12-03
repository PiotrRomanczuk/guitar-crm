'use client';

import { useSongs } from './useSongs';

interface SongSelectProps {
  selectedSongIds: string[];
  onChange: (songIds: string[]) => void;
  error?: string;
}

export function SongSelect({ selectedSongIds, onChange, error }: SongSelectProps) {
  const { songs, loading, error: songsError } = useSongs();

  if (loading) return <div className="text-sm text-gray-500">Loading songs...</div>;
  if (songsError)
    return <div className="text-sm text-red-500">Error loading songs: {songsError}</div>;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange(selectedOptions);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Songs</label>
      <select
        multiple
        value={selectedSongIds || []}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 p-2"
        style={{ height: '150px' }}
      >
        {songs.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title} - {song.author}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">Hold Ctrl (Cmd) to select multiple songs</p>
    </div>
  );
}
