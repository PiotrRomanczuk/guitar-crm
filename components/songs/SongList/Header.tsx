import Link from 'next/link';

interface Props {
  canManageSongs: boolean;
}

export default function SongListHeader({ canManageSongs }: Props) {
  return (
    <div className="flex items-center justify-between py-4">
      <h2 className="text-2xl font-bold">Song Library</h2>
      {canManageSongs && (
        <Link href="/dashboard/songs/new">
          <button
            data-testid="song-new-button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create new song
          </button>
        </Link>
      )}
    </div>
  );
}
