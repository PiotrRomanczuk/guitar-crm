import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { SongListClient } from './Client';
import type { Song } from '../types';

// Explicit columns for the song list query.
// Excludes search_vector (tsvector/unknown type) which is not needed in the UI
// and can cause serialization issues between server and client components.
const SONG_LIST_COLUMNS = `
  id, title, author, short_title, level, key,
  capo_fret, strumming_pattern, tempo, time_signature,
  duration_ms, release_year, category, chords,
  ultimate_guitar_link, youtube_url, spotify_link_url,
  cover_image_url, gallery_images, audio_files,
  deleted_at, created_at, updated_at, tiktok_short_url,
  lesson_songs (
    id,
    status,
    lessons (
      id,
      student_id,
      profile:profiles!lessons_student_id_fkey (
        id,
        full_name
      )
    )
  )
`;

interface SongListProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function SongList({ searchParams }: SongListProps) {
  const { user, isAdmin, isTeacher } = await getUserWithRolesSSR();

  if (!user) {
    return <div data-testid="song-list-error">Not authenticated</div>;
  }

  const supabase = await createClient();

  const studentId =
    typeof searchParams?.studentId === 'string' ? searchParams.studentId : undefined;
  const search = typeof searchParams?.search === 'string' ? searchParams.search : undefined;
  const level = typeof searchParams?.level === 'string' ? searchParams.level : undefined;
  // Virtual scrolling - fetch all songs (no pagination)

  let songQuery;

  if (studentId) {
    songQuery = supabase
      .from('songs')
      .select(
        `${SONG_LIST_COLUMNS}, lesson_songs!inner(id, status, lessons!inner(student_id))`,
        { count: 'exact' }
      )
      .eq('lesson_songs.lessons.student_id', studentId);
  } else {
    songQuery = supabase.from('songs').select(SONG_LIST_COLUMNS, { count: 'exact' });
  }

  if (search) {
    songQuery = songQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
  }

  if (level && level !== 'all') {
    songQuery = songQuery.eq('level', level);
  }

  songQuery = songQuery.order('updated_at', { ascending: false }); // Most recently updated first

  const { data: rawSongs, error } = await songQuery;

  if (error) {
    console.error('Error fetching songs:', error);
    return (
      <div data-testid="song-list-error">
        Error loading songs: {String(error.message)}
      </div>
    );
  }

  // Transform songs: calculate stats and add status fields for student filtering
  const songs = (rawSongs?.map((rawSong) => {
    const { lesson_songs, ...song } = rawSong as unknown as Record<string, unknown> & {
      lesson_songs?: Array<{
        id: string;
        status: string;
        lessons: {
          id: string;
          student_id: string;
          profile: { id: string; full_name: string | null } | null;
        } | null;
      }>;
    };

    // Calculate stats
    const lessonSongsArray = lesson_songs || [];
    const uniqueStudents = new Set(
      lessonSongsArray
        .map((ls) => ls.lessons?.student_id)
        .filter(Boolean)
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

    if (
      studentId &&
      lessonSongsArray.length > 0
    ) {
      return {
        ...song,
        status: lessonSongsArray[0].status,
        lesson_song_id: lessonSongsArray[0].id,
        stats,
      };
    }
    return { ...song, stats };
  }) || []) as unknown as Song[];

  // Fetch students for filter (only if admin or teacher)
  let students: { id: string; full_name: string | null }[] = [];

  if (isAdmin || isTeacher) {
    const { data: studentsData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('is_student', true)
      .order('full_name');

    students = studentsData || [];
  }

  return (
    <SongListClient
      initialSongs={songs}
      isAdmin={isAdmin || isTeacher}
      students={students}
      selectedStudentId={studentId}
    />
  );
}
