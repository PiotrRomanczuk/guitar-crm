import { SongList } from '@/components/songs';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { redirect } from 'next/navigation';
import { StudentSongsPageClient } from '@/components/songs/student/StudentSongsPageClient';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

import { createClient } from '@supabase/supabase-js';
import { Song } from '@/types/Song';

export default async function SongsPage(props: Props) {
  const searchParams = await props.searchParams;
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user) {
    redirect('/sign-in');
  }

  // If user is a student and NOT an admin/teacher, show the student view
  if (isStudent && !isAdmin && !isTeacher) {
    // Fetch songs server-side to bypass RLS issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    const { data: lessonSongs, error } = await supabaseAdmin
      .from('lesson_songs')
      .select(
        `
        id,
        status,
        lessons!inner (student_id),
        songs!inner (
          id,
          title,
          author,
          level,
          key,
          chords,
          ultimate_guitar_link,
          cover_image_url
        )
      `
      )
      .eq('lessons.student_id', user.id);

    if (error) {
      console.error('[SongsPage] Error fetching student songs:', error);
    }

    const processedSongsMap = new Map<string, Song>();
    type LessonSongResult = {
      id: string;
      status: string;
      lessons: { student_id: string };
      songs: {
        id: string;
        title: string;
        author: string | null;
        level: string | null;
        key: string | null;
        chords: string[] | null;
        ultimate_guitar_link: string | null;
        cover_image_url: string | null;
      };
    };
    (lessonSongs as LessonSongResult[] | null)?.forEach((lessonSong) => {
        const song = Array.isArray(lessonSong.songs) ? lessonSong.songs[0] : lessonSong.songs;
        if (!song || processedSongsMap.has(song.id)) return;

        processedSongsMap.set(song.id, {
        ...song,
        status: lessonSong.status,
        } as Song);
    });
    
    return <StudentSongsPageClient />;
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <SongList searchParams={searchParams} />
    </div>
  );
}
