import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { SongListClient } from './Client';

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
      .select('*, lesson_songs!inner(id, status, lessons!inner(student_id))', { count: 'exact' })
      .eq('lesson_songs.lessons.student_id', studentId);
  } else {
    songQuery = supabase.from('songs').select('*', { count: 'exact' });
  }

  if (search) {
    songQuery = songQuery.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
  }

  if (level && level !== 'all') {
    songQuery = songQuery.eq('level', level);
  }

  songQuery = songQuery.order('created_at', { ascending: false }).range(from, to);

  const { data: rawSongs, count, error } = await songQuery;

  if (error) {
    console.error('Error fetching songs:', error);
    return <div data-testid="song-list-error">Error loading songs: {error.message}</div>;
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Transform songs to include status if filtering by student
  const songs =
    rawSongs?.map((song) => {
      if (
        studentId &&
        song.lesson_songs &&
        Array.isArray(song.lesson_songs) &&
        song.lesson_songs.length > 0
      ) {
        // When using !inner join, Supabase returns the joined data.
        // We take the status from the first matching lesson_song.
        // Note: The query structure ensures these lesson_songs belong to the student.
        return {
          ...song,
          status: song.lesson_songs[0].status,
          lesson_song_id: song.lesson_songs[0].id,
        };
      }
      return song;
    }) || [];

  // Fetch students for filter (only if admin or teacher)
  let students: { id: string; full_name: string | null }[] = [];

  // We don't need songStudentMap anymore for client-side filtering,
  // but we might want to keep it if we want to show which students are assigned to a song in the list?
  // The user asked for "filtration", so SSR filtration is the key.
  // I will remove songStudentMap logic as it's heavy and we are moving to SSR.

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
