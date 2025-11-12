import UserDetail from '@/components/users/UserDetail';
import UserLessons from '@/components/users/UserLessons';
import UserAssignments from '@/components/users/UserAssignments';
import UserSongs from '@/components/users/UserSongs';
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
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_development: boolean;
  is_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;
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

  // Fetch songs connected to this user's lessons
  const { data: lessonSongs } = await supabase
    .from('lesson_songs')
    .select(
      `
      song_id,
      status,
      songs (
        id,
        title,
        author,
        key,
        level,
        created_at
      ),
      lessons!inner (
        student_id,
        teacher_id
      )
    `
    )
    .or(`lessons.student_id.eq.${userId},lessons.teacher_id.eq.${userId}`);

  // Extract unique songs (songs is a single object, not an array)
  const songMap = new Map<string, Song>();
  if (lessonSongs) {
    lessonSongs.forEach((ls) => {
      // Supabase returns songs as a single object when using the foreign key relation
      const song = ls.songs as unknown as Song;
      if (song && song.id && !songMap.has(song.id)) {
        songMap.set(song.id, song);
      }
    });
  }
  const songs = Array.from(songMap.values());

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

  return (
    <div className="container mx-auto px-4 py-8">
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
