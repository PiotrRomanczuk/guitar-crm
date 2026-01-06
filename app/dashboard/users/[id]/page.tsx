import { UserDetail, UserLessons, UserAssignments, UserSongs } from '@/components/users';
import { Breadcrumbs } from '@/components/shared';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';
import { SongStatusHistory } from '@/components/shared/SongStatusHistory';

const log = createLogger('UserDetailPage');

export const metadata = {
  title: 'User Detail',
  description: 'View user details',
};

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<SearchParams>;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_development: boolean;
  is_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;
  is_shadow: boolean | null;
}

interface Song {
  id: string;
  title: string;
  author: string;
  key: string | null;
  level: string | null;
  created_at: string | null;
}

async function fetchUserData(supabase: SupabaseClient, userId: string) {
  // Fetch lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select(
      `
      *,
      student:profiles!lessons_student_id_fkey(id, full_name, email),
      teacher:profiles!lessons_teacher_id_fkey(id, full_name, email)
    `
    )
    .or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  // Fetch assignments
  const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // First, get all lessons for this user
  const userLessonIds = lessons?.map((l) => l.id) || [];
  log.debug('User lessons fetched', { count: lessons?.length, lessonIds: userLessonIds });

  // Then fetch songs connected to those lessons - simplified query
  let lessonSongs: Array<{ song_id: string; status: string }> = [];
  let songsError = null;

  if (userLessonIds.length > 0) {
    const { data, error } = await supabase
      .from('lesson_songs')
      .select('song_id, status')
      .in('lesson_id', userLessonIds);

    lessonSongs = data || [];
    songsError = error;
  }

  if (songsError) {
    log.error('Lesson songs query error', { error: songsError });
  }
  log.debug('Lesson songs fetched', { count: lessonSongs?.length });

  // Now fetch the actual song details for unique song IDs
  const uniqueSongIds = [...new Set(lessonSongs.map((ls) => ls.song_id))];
  log.debug('Unique song IDs', { count: uniqueSongIds.length });

  let songs: Song[] = [];
  if (uniqueSongIds.length > 0) {
    const { data: songsData } = await supabase
      .from('songs')
      .select('id, title, author, key, level, created_at')
      .in('id', uniqueSongIds);

    songs = (songsData || []) as Song[];
  }

  log.debug('Final songs fetched', { count: songs.length });

  return { lessons, assignments, songs };
}
export default async function UserDetailPage({ params, searchParams }: UserDetailPageProps) {
  // In Next.js 16+, params is a Promise that needs to be awaited
  const { id } = await params;
  // Ensure searchParams are awaited
  await searchParams;
  const userId = id;

  // Get current user and check admin status
  const currentUser = await getUserWithRolesSSR();
  if (!currentUser) {
    notFound();
  }

  // Initialize Supabase client (await it since createClient returns Promise)
  const supabase = await createClient();

  // Fetch user profile with admin authorization
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    notFound();
  }

  // Fetch related data
  const { lessons, assignments, songs } = await fetchUserData(supabase, userId);

  const userName = user.full_name || user.email || 'User';

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/dashboard/users' },
          { label: userName },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <UserDetail user={user as UserProfile} />

          {/* Lessons Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 Lessons</h2>
            <UserLessons lessons={lessons || []} />
          </div>

          {/* Assignments Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              📝 Assignments
            </h2>
            <UserAssignments assignments={assignments || []} />
          </div>

          {/* Songs Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              🎵 Songs from Lessons
            </h2>
            <UserSongs songs={songs || []} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <SongStatusHistory studentId={userId} title="Learning Progress" />
        </div>
      </div>
    </div>
  );
}
