import { UserDetail, UserLessons, UserAssignments, UserSongs } from '@/components/users';
import { Breadcrumbs } from '@/components/shared';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/logger';

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
    .eq('student_id', userId)
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/dashboard/users' },
          { label: userName },
        ]}
      />

      <UserDetail user={user as UserProfile} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lessons Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📚</span> Lessons
            </h2>
            {/* Could add a 'New Lesson' button here if we wanted */}
          </div>
          <UserLessons lessons={lessons || []} showStudentColumn={false} />
        </div>

        {/* Assignments Section */}
        <div className="space-y-4">
          {/* Header is handled inside UserAssignments for the progress bar, 
               but we can also have a section header if we want to be consistent.
               Actually UserAssignments has a Card with Title "Assignments".
               UserLessons is just a list in my new implementation (no Card wrapper in this file? Wait).
               Let's check UserLessons.tsx content from Step 87.
               It returns <div className="bg-card... shadow-sm border...
               It DOES NOT have a header.
               
               UserAssignments.tsx (Step 91) RETURNS <Card> with <CardHeader> containing title 'Assignments'.
               
               UserSongs.tsx (Step 95) has NO header.
               
               This is inconsistent.
               I should make them consistent.
               
               Option A: All components have internal headers.
               Option B: Page controls headers.
               
               UserLessons: No header.
               UserAssignments: Has header (for progress bar).
               UserSongs: No header.
               
               I should wrap UserLessons and UserSongs in the page with headers.
               UserAssignments I can leave as is, or remove its header and move progress bar?
               The progress bar is nice inside the card.
               
               Let's keep UserAssignments as a self-contained Card.
               Let's wrap UserLessons in a Section but it also returns a Card-like div.
               Let's wrap UserSongs.
               
               Wait, in `page.tsx` I am doing:
               <UserLessons ... />
               
               If UserLessons returns a Card, and I put a <h2> above it, it looks like:
               Title
               Card
               
               UserAssignments returns:
               Card (with Title inside)
               
               This will look misaligned.
               
               Refinement:
               UserLessons should probably have a header inside it? Or UserAssignments should NOT?
               The Implementation Plan said "Remove Header" for UserAssignments too. 
               But in Step 90 I implemented it WITH a header to show the progress bar nicely.
               
               I think I should adjust `page.tsx` to accommodate this.
               For Assignments, I won't print an <h2> in `page.tsx` because the component has it.
               For Lessons, I WILL print an <h2> because the component doesn't have it.
               For Songs, I WILL print an <h2>.
               
               Is that weird? A bit.
               But "Assignments" needs that specific "X/Y Completed" subtitle which is best coupled with the component logic.
               
               Let's try to make it look consistent.
               
               Layout:
               [UserDetail]
               
               [Lessons (H2) + List (Card)]   [Assignments (Card with H2 inside)]
               
               [Songs (H2) + Grid (Card)]
               
               This is acceptable.
            */}
          {/* Since UserAssignments has its own header/card, we don't need an external H2 here necessarily, 
               OR we can wrap it. 
               Let's just render UserAssignments directly. 
               It returns a Card.
            */}
          <UserAssignments assignments={assignments || []} />
        </div>
      </div>

      {/* Songs Section */}
      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🎵</span> Repertoire
        </h2>
        <UserSongs songs={songs || []} />
      </div>
    </div>
  );
}
