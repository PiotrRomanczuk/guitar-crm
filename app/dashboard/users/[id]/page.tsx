import UserDetail from '@/components/users/UserDetail';
import UserLessons from '@/components/users/UserLessons';
import UserAssignments from '@/components/users/UserAssignments';
import UserSongs from '@/components/users/UserSongs';
import { Breadcrumbs } from '@/components/shared';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';

export const metadata = {
  title: 'User Detail',
  description: 'View user details',
};

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
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
  console.log('User lessons count:', lessons?.length);
  console.log('User lesson IDs:', userLessonIds);

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

  console.log('Lesson songs query error:', songsError);
  console.log('Lesson songs count:', lessonSongs?.length);
  console.log('Lesson songs data:', JSON.stringify(lessonSongs, null, 2));

  // Now fetch the actual song details for unique song IDs
  const uniqueSongIds = [...new Set(lessonSongs.map((ls) => ls.song_id))];
  console.log('Unique song IDs:', uniqueSongIds);

  let songs: Song[] = [];
  if (uniqueSongIds.length > 0) {
    const { data: songsData } = await supabase
      .from('songs')
      .select('id, title, author, key, level, created_at')
      .in('id', uniqueSongIds);

    songs = (songsData || []) as Song[];
  }

  console.log('Final songs array:', songs);
  console.log('Final songs count:', songs.length);

  return { lessons, assignments, songs };
}
export default async function UserDetailPage({ params }: UserDetailPageProps) {
  // In Next.js 16+, params is a Promise that needs to be awaited
  const { id } = await params;
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

      <UserDetail user={user as UserProfile} />

      {/* Lessons Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📚 Lessons</h2>
        <UserLessons lessons={lessons || []} />
      </div>

      {/* Assignments Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">📝 Assignments</h2>
        <UserAssignments assignments={assignments || []} />
      </div>

      {/* Songs Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          🎵 Songs from Lessons
        </h2>
        <UserSongs songs={songs || []} />
      </div>
    </div>
  );
}
