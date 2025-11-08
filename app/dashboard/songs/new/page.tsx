import SongFormGuard from '@/components/songs/SongFormGuard';

export default function NewSongPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SongFormGuard mode="create" />
    </div>
  );
}
