import Link from 'next/link';
import Image from 'next/image';

export default function SongListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-64 h-48 mb-6">
        <Image
          src="/illustrations/no-songs-added--inviting-empty-state-art-for-a-son.png"
          alt="No songs added"
          fill
          className="object-contain"
        />
      </div>
      <p className="text-lg text-muted-foreground mb-4">No songs found</p>
      <Link href="/dashboard/songs/new">
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
          Create your first song
        </button>
      </Link>
    </div>
  );
}
