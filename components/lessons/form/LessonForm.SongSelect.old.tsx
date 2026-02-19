'use client';

import { useSongs } from '../hooks/useSongs';

interface SongSelectProps {
  selectedSongIds: string[];
  onChange: (songIds: string[]) => void;
  error?: string;
}

export function SongSelect({ selectedSongIds, onChange, error }: SongSelectProps) {
  const { songs, loading, error: songsError } = useSongs();

  if (loading) return <div className="text-sm text-muted-foreground">Loading songs...</div>;
  if (songsError)
    return <div className="text-sm text-destructive">Error loading songs: {songsError}</div>;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange(selectedOptions);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Songs</label>
      <select
        multiple
        value={selectedSongIds || []}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-background p-2"
        style={{ height: '150px' }}
      >
        {songs.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title} - {song.author}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Hold Ctrl (Cmd) to select multiple songs</p>
    </div>
  );
}
