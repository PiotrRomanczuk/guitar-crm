import { UserDetail } from '@/components/users';
import { Breadcrumbs } from '@/components/shared';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { notFound } from 'next/navigation';
import { createLogger } from '@/lib/logger';
import { UserDetailTabs } from '@/components/users/details/UserDetailTabs';
import type { Lesson } from '@/components/users/details/UserDetailTabs';
import type { StudentRepertoireWithSong } from '@/types/StudentRepertoire';

const log = createLogger('UserDetailPage');

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', id)
    .single();
  const name = data?.full_name || data?.email || 'User';
  return { title: `${name} — User Detail`, description: `View and manage ${name}'s profile` };
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchUserData(supabase: SupabaseClient<any>, userId: string) {
  // Fetch lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select(
      `
      id, lesson_teacher_number, lesson_number, status, date, scheduled_at, created_at,
      student:profiles!lessons_student_id_fkey(id, full_name, email),
      teacher:profiles!lessons_teacher_id_fkey(id, full_name, email)
    `
    )
    .or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  // Fetch assignments
  const { data: assignments } = await supabase
    .from('assignments')
    .select('id, title, description, status, due_date, created_at')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });

  // Fetch repertoire directly from student_repertoire with joined song data
  const { data: repertoire, error: repertoireError } = await supabase
    .from('student_repertoire')
    .select(
      `
      *,
      song:songs!inner (
        id, title, author, level, key, capo_fret, strumming_pattern
      )
    `
    )
    .eq('student_id', userId)
    .order('priority', { ascending: true })
    .order('sort_order', { ascending: true });

  if (repertoireError) {
    log.error('Repertoire fetch error', { error: repertoireError });
  }

  // Map the joined song data to the expected shape
  const mappedRepertoire: StudentRepertoireWithSong[] = (repertoire || []).map(
    (row: Record<string, unknown>) => ({
      ...row,
      song: Array.isArray(row.song) ? row.song[0] : row.song,
    })
  ) as StudentRepertoireWithSong[];

  log.debug('User data fetched', {
    lessons: lessons?.length,
    assignments: assignments?.length,
    repertoire: mappedRepertoire.length,
  });

  return { lessons, assignments, repertoire: mappedRepertoire };
}

export default async function UserDetailPage({ params, searchParams }: UserDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const userId = id;
  const activeTab = (resolvedSearchParams.tab as string) || 'overview';

  const currentUser = await getUserWithRolesSSR();
  if (!currentUser) {
    notFound();
  }

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, notes, created_at, updated_at, is_development, is_admin, is_teacher, is_student, is_shadow')
    .eq('id', userId)
    .single();

  if (error || !user) {
    notFound();
  }

  const { lessons, assignments, repertoire } = await fetchUserData(supabase, userId);
  const userName = user.full_name || user.email || 'User';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/dashboard/users' },
          { label: userName },
        ]}
      />

      <UserDetail user={user as UserProfile} />

      <UserDetailTabs
        userId={userId}
        activeTab={activeTab}
        lessons={(lessons || []) as unknown as Lesson[]}
        assignments={assignments || []}
        repertoire={repertoire}
      />
    </div>
  );
}
