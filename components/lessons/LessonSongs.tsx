'use client';

import { useEffect, useState } from 'react';
import { RelatedItemsSection, StatusBadge, getStatusVariant, formatStatus } from '@/components/shared';

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

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Lesson Songs</h2>
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  const songItems = songs.map((lessonSong) => ({
    id: lessonSong.id,
    href: `/dashboard/songs/${lessonSong.song_id}`,
    title: lessonSong.song?.title || 'Unknown Song',
    subtitle: `by ${lessonSong.song?.author || 'Unknown Artist'}`,
    badge: (
      <StatusBadge variant={getStatusVariant(lessonSong.status)}>
        {formatStatus(lessonSong.status)}
      </StatusBadge>
    ),
    metadata: [
      ...(lessonSong.song?.level
        ? [
            {
              label: 'Level',
              value: (
                <StatusBadge variant={getStatusVariant(lessonSong.song.level)}>
                  {lessonSong.song.level}
                </StatusBadge>
              ),
            },
          ]
        : []),
      ...(lessonSong.notes
        ? [
            {
              label: 'Notes',
              value: lessonSong.notes,
            },
          ]
        : []),
    ],
  }));

  return (
    <RelatedItemsSection
      title="Lesson Songs"
      items={songItems}
      loading={loading}
      emptyMessage="No songs assigned to this lesson yet."
      createAction={{
        label: 'Add Song',
        href: `/dashboard/lessons/${lessonId}/songs/add`,
      }}
      className="mb-6"
      testId="lesson-songs-section"
    />
  );
}
