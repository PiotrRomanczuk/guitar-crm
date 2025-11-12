'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LessonSong {
  id: string;
  song_id: string;
  status: 'to_learn' | 'started' | 'remembered' | 'with_author' | 'mastered' | null;
  notes?: string;
  song?: {
    id: string;
    title: string;
    author: string;
    level: string;
  };
}

interface Props {
  lessonId: string;
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'to_learn':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    case 'started':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    case 'remembered':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    case 'with_author':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
    case 'mastered':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  }
}

function formatStatus(status: string | null): string {
  if (!status) return 'To Learn';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function LessonSongs({ lessonId }: Props) {
  const [songs, setSongs] = useState<LessonSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLessonSongs() {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/songs`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch: ${response.status}`);
        }

        setSongs(data.songs || []);
      } catch (err) {
        console.error('Error fetching lesson songs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        setLoading(false);
      }
    }

    fetchLessonSongs();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Lesson Songs</h2>
        <p className="text-gray-600 dark:text-gray-400">Loading songs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Lesson Songs</h2>
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Lesson Songs ({songs.length})
      </h2>
      {songs.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No songs assigned to this lesson yet.</p>
      ) : (
        <div className="space-y-3">
          {songs.map((lessonSong) => (
            <div
              key={lessonSong.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/dashboard/songs/${lessonSong.song_id}`}
                    className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {lessonSong.song?.title || 'Unknown Song'}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {lessonSong.song?.author || 'Unknown Artist'}
                  </p>
                  {lessonSong.song?.level && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Level: {lessonSong.song.level}
                    </p>
                  )}
                  {lessonSong.notes && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      📝 {lessonSong.notes}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    lessonSong.status
                  )}`}
                >
                  {formatStatus(lessonSong.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
