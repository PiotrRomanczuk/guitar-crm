import { Suspense } from 'react';
import { UsersList } from '@/components/users';
import { createClient } from '@/lib/supabase/server';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { ListPageSkeleton } from '@/components/ui/skeleton-screens';

export const metadata = {
  title: 'Users',
  description: 'Manage users in the system',
};

async function fetchInitialUsers() {
  const { user, isAdmin, isTeacher, isStudent } = await getUserWithRolesSSR();

  if (!user || (!isAdmin && !isTeacher && !isStudent)) {
    return [];
  }

  const supabase = await createClient();

  // Student: only see own profile
  if (isStudent && !isAdmin && !isTeacher) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return data ? [data] : [];
  }

  // Teacher: see students from active lessons
  let query = supabase.from('profiles').select('*');

  if (isTeacher && !isAdmin) {
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('student_id')
      .eq('teacher_id', user.id)
      .is('deleted_at', null);

    const allowedStudentIds = Array.from(
      new Set((lessonData || []).map((l) => l.student_id))
    );

    if (allowedStudentIds.length === 0) {
      return [];
    }

    query = query.in('id', allowedStudentIds);
  }

  // Fetch initial users (first 50, no filters)
  const { data } = await query.limit(50);

  return data || [];
}

export default async function UsersPage() {
  const initialUsers = await fetchInitialUsers();

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="space-y-4 sm:space-y-6 opacity-0 animate-fade-in">
        <Suspense fallback={<ListPageSkeleton />}>
          <UsersList initialUsers={initialUsers} />
        </Suspense>
      </div>
    </div>
  );
}
