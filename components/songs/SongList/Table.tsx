import Link from 'next/link';
import type { Song } from '../types';

interface Props {
  songs: Song[];
}

export default function SongListTable({ songs }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Author</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Level</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Key</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => (
            <tr key={song.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  href={`/dashboard/songs/${song.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {song.title}
                </Link>
              </td>
              <td className="border border-gray-300 px-4 py-2">{song.author}</td>
              <td className="border border-gray-300 px-4 py-2">{song.level}</td>
              <td className="border border-gray-300 px-4 py-2">{song.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
