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
  deleted_at, created_at, updated_at, tiktok_short_url
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
  const pageParam = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const pageSizeParam =
    typeof searchParams?.pageSize === 'string' ? parseInt(searchParams.pageSize) : 15;
  const pageSize = isNaN(pageSizeParam) || pageSizeParam < 1 ? 15 : pageSizeParam;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

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

  songQuery = songQuery.order('created_at', { ascending: false }).range(from, to);

  const { data: rawSongs, count, error } = await songQuery;

  if (error) {
    console.error('Error fetching songs:', error);
    return (
      <div data-testid="song-list-error">
        Error loading songs: {String(error.message)}
      </div>
    );
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Transform songs: strip join data and add status fields for student filtering
  const songs = (rawSongs?.map((rawSong) => {
    // Remove lesson_songs join data if present, keep only song columns
    const { lesson_songs, ...song } = rawSong as Record<string, unknown> & {
      lesson_songs?: Array<{ id: string; status: string }>;
    };

    if (
      studentId &&
      lesson_songs &&
      Array.isArray(lesson_songs) &&
      lesson_songs.length > 0
    ) {
      return {
        ...song,
        status: lesson_songs[0].status,
        lesson_song_id: lesson_songs[0].id,
      };
    }
    return song;
  }) || []) as Song[];

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
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
