'use client';

import { useEffect, useState } from 'react';
import {
  RelatedItemsSection,
  EntityLink,
  StatusBadge,
  getStatusVariant,
  formatStatus,
} from '@/components/shared';

interface SongLesson {
  id: string;
  lesson_teacher_number: number | null;
  scheduled_at: string | null;
  lesson_status: string | null;
  song_status: string | null;
  student_id: string;
  teacher_id: string;
  student: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
  teacher: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface Props {
  songId: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
}

export default function SongLessons({ songId }: Props) {
  const [lessons, setLessons] = useState<SongLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSongLessons() {
      try {
        const response = await fetch(`/api/song/${songId}/lessons`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to fetch: ${response.status}`);
        }

        setLessons(data.lessons || []);
      } catch (err) {
        console.error('Error fetching song lessons:', err);
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    }

    fetchSongLessons();
  }, [songId]);

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-foreground">
          Lessons Using This Song
        </h2>
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  const lessonItems = lessons.map((lesson) => ({
    id: lesson.id,
    href: `/dashboard/lessons/${lesson.id}`,
    title: `Lesson #${lesson.lesson_teacher_number || 'N/A'}`,
    subtitle: formatDate(lesson.scheduled_at),
    badge: (
      <StatusBadge variant={getStatusVariant(lesson.lesson_status)}>
        {formatStatus(lesson.lesson_status)}
      </StatusBadge>
    ),
    metadata: [
      {
        label: 'Student',
        value: (
          <EntityLink href={`/dashboard/users/${lesson.student_id}`}>
            {lesson.student?.full_name || lesson.student?.email || 'Unknown'}
          </EntityLink>
        ),
      },
      {
        label: 'Teacher',
        value: (
          <EntityLink href={`/dashboard/users/${lesson.teacher_id}`}>
            {lesson.teacher?.full_name || lesson.teacher?.email || 'Unknown'}
          </EntityLink>
        ),
      },
      {
        label: 'Progress',
        value: (
          <StatusBadge variant={getStatusVariant(lesson.song_status)}>
            {formatStatus(lesson.song_status)}
          </StatusBadge>
        ),
      },
    ],
  }));

  return (
    <RelatedItemsSection
      title="Lessons Using This Song"
      items={lessonItems}
      loading={loading}
      emptyMessage="This song hasn't been used in any lessons yet."
      createAction={{
        label: 'Add to Lesson',
        href: `/dashboard/lessons/new?song=${songId}`,
      }}
      className="mb-6"
      testId="song-lessons-section"
    />
  );
}
