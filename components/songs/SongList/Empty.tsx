import Link from 'next/link';

export default function SongListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className="text-lg text-gray-600 mb-4">No songs found</p>
      <Link href="/dashboard/songs/new">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create your first song
        </button>
      </Link>
    </div>
  );
}
