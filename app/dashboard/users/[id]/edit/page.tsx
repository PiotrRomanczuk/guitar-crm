import { createClient } from '@/lib/supabase/server';
import { UserForm } from '@/components/users';

export const metadata = {
  title: 'Edit User',
  description: 'Edit user information',
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  is_admin: boolean;
  is_teacher: boolean;
  is_student: boolean;
  is_active: boolean | null;
  is_shadow: boolean | null;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, username, is_admin, is_teacher, is_student, is_active, is_shadow')
    .eq('id', id)
    .single();

  if (error || !user) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
        User not found
      </div>
    );
  }

  const transformedUser = transformUser(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
        <p className="text-muted-foreground">Update user information</p>
      </div>
      <UserForm initialData={transformedUser} isEdit={true} />
    </div>
  );
}

function transformUser(user: ProfileRow) {
  const { firstName, lastName } = getNameParts(user);

  return {
    id: user.id,
    firstName,
    lastName,
    email: user.email,
    username: user.username || null,
    isAdmin: user.is_admin ?? false,
    isTeacher: user.is_teacher ?? false,
    isStudent: user.is_student ?? false,
    isActive: user.is_active ?? true,
  };
}

function getNameParts(user: ProfileRow) {
  if (user.full_name) {
    const parts = user.full_name.split(' ');
    return {
      firstName: parts[0] ?? null,
      lastName: parts.slice(1).join(' ') || null,
    };
  }
  return { firstName: null, lastName: null };
}
