'use client';

import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  author: string;
  key: string | null;
  level: string | null;
}

interface UserSongsProps {
  songs: Song[] | null;
}

export default function UserSongs({ songs }: UserSongsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            🎵 Recent Songs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {songs?.length || 0} song{songs?.length !== 1 ? 's' : ''} in the library
          </p>
        </div>
      </div>

      {/* Songs Grid */}
      {songs && songs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/dashboard/songs/${song.id}`}
              className="group p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/10"
            >
              <div className="flex flex-col gap-3">
                {/* Song Title */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {song.title}
                  </p>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      song.level === 'beginner'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : song.level === 'intermediate'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}
                  >
                    {song.level || 'unknown'}
                  </span>
                </div>

                {/* Song Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-base">🎤</span>
                    <span className="truncate">{song.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-base">🎹</span>
                    <span className="font-mono font-semibold">{song.key || 'Unknown key'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg">🎵 No songs found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Songs will appear here once added to the library
          </p>
        </div>
      )}
    </div>
  );
}
