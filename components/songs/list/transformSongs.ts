import type { Song } from '../types';

interface RawLessonSong {
  id: string;
  status: string;
  lessons: {
    id: string;
    student_id: string;
    profile: { id: string; full_name: string | null } | null;
  } | null;
}

type RawSong = Record<string, unknown> & { lesson_songs?: RawLessonSong[] };

export function transformRawSongs(rawSongs: unknown[] | null, studentId?: string): Song[] {
  if (!rawSongs) return [];

  return rawSongs.map((rawSong) => {
    const { lesson_songs, ...song } = rawSong as RawSong;

    const lessonSongsArray = lesson_songs || [];
    const uniqueStudents = new Set(
      lessonSongsArray.map((ls) => ls.lessons?.student_id).filter(Boolean)
    );

    const statusCounts = lessonSongsArray.reduce(
      (acc, ls) => {
        const status = ls.status || 'to_learn';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const stats = {
      lessonCount: lessonSongsArray.length,
      studentCount: uniqueStudents.size,
      statusBreakdown: {
        mastered: statusCounts.mastered || 0,
        learning: statusCounts.learning || 0,
        to_learn: statusCounts.to_learn || 0,
      },
    };

    if (studentId && lessonSongsArray.length > 0) {
      return {
        ...song,
        status: lessonSongsArray[0].status,
        lesson_song_id: lessonSongsArray[0].id,
        stats,
      };
    }
    return { ...song, stats };
  }) as unknown as Song[];
}
