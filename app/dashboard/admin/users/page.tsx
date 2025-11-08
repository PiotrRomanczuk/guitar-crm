import { RequireAdmin } from '@/components/auth';
import { AdminUsersClient } from '@/components/dashboard/admin/AdminUsersClient';
import { getUserWithRolesSSR } from '@/lib/getUserWithRolesSSR';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/schemas/UserSchema';

async function fetchInitialUsers(): Promise<{ users: User[]; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 49); // Limit to 50 users

    if (error) {
      throw error;
    }

    return { users: data || [], error: null };
  } catch (err) {
    return {
      users: [],
      error: err instanceof Error ? err.message : 'Failed to load users',
    };
  }
}

export default async function AdminUsersPage() {
  const { isAdmin } = await getUserWithRolesSSR();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  const { users, error } = await fetchInitialUsers();

  return (
    <RequireAdmin>
      <AdminUsersClient initialUsers={users} initialError={error} />
    </RequireAdmin>
  );
}
