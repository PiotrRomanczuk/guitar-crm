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
  const key = typeof searchParams?.key === 'string' ? searchParams.key : undefined;
  const category = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  const author = typeof searchParams?.author === 'string' ? searchParams.author : undefined;
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 20;

  let songQuery;

  // TODO: Re-enable soft delete filtering after fixing delete implementation
  // Currently causing issues with song deletion not being reflected immediately
  if (studentId) {
    songQuery = supabase
      .from('songs')
      .select('*, lesson_songs!inner(id, status, lessons!inner(student_id))')
      .eq('lesson_songs.lessons.student_id', studentId);
    // .is('deleted_at', null);  // TODO: Uncomment after fixing
  } else {
    songQuery = supabase.from('songs').select('*');
    // .is('deleted_at', null);  // TODO: Uncomment after fixing
  }

  if (search) {
    songQuery = songQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
  }

  if (level && level !== 'all') {
    songQuery = songQuery.eq('level', level);
  }

  if (key && key !== 'all') {
    songQuery = songQuery.eq('key', key);
  }

  if (category && category !== 'all') {
    songQuery = songQuery.eq('category', category);
  }

  if (author && author !== 'all') {
    songQuery = songQuery.eq('author', author);
  }

  songQuery = songQuery.order('created_at', { ascending: false });

  // Get total count for pagination
  const countQuery = studentId
    ? supabase
        .from('songs')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_songs.lessons.student_id', studentId)
    : supabase.from('songs').select('id', { count: 'exact', head: true });

  const { count } = await countQuery;
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  songQuery = songQuery.range(from, to);

  const { data: rawSongs, error } = await songQuery;

  if (error) {
    console.error('Error fetching songs:', error);
    return <div data-testid="song-list-error">Error loading songs: {error.message}</div>;
  }

  // Fetch distinct categories for filter
  const { data: categoriesData } = await supabase
    .from('songs')
    .select('category')
    .not('category', 'is', null)
    // .is('deleted_at', null)  // TODO: Re-enable after fixing delete implementation
    .order('category');

  const categories = Array.from(
    new Set(categoriesData?.map((c) => c.category).filter(Boolean))
  ) as string[];

  // Fetch distinct authors for filter
  const { data: authorsData } = await supabase
    .from('songs')
    .select('author')
    .not('author', 'is', null)
    // .is('deleted_at', null)  // TODO: Re-enable after fixing delete implementation
    .order('author');

  const authors = Array.from(
    new Set(authorsData?.map((a) => a.author).filter(Boolean))
  ) as string[];

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
      categories={categories}
      authors={authors}
      currentPage={page}
      totalPages={totalPages}
    />
  );
}
