import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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
      <Button asChild>
        <Link href="/dashboard/songs/new">Create your first song</Link>
      </Button>
    </div>
  );
}
