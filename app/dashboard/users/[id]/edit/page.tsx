import { createClient } from '@/lib/supabase/server';
import UserForm from '@/components/users/UserForm';

export const metadata = {
  title: 'Edit User',
  description: 'Edit user information',
};

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: user, error } = await supabase.from('profiles').select('*').eq('id', id).single();

  if (error || !user) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
        {id}
        User not found
      </div>
    );
  }

  const transformedUser = transformUser(user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit User</h1>
        <p className="text-gray-600 dark:text-gray-400">Update user information</p>
      </div>
      <UserForm initialData={transformedUser} isEdit={true} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformUser(user: any) {
  const { firstName, lastName } = getNameParts(user);

  return {
    id: user.id,
    firstName,
    lastName,
    email: user.email,
    username: user.username || null,
    isAdmin: getRole(user, 'admin'),
    isTeacher: getRole(user, 'teacher'),
    isStudent: getRole(user, 'student'),
    isActive: user.isActive ?? true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNameParts(user: any) {
  if (user.full_name) {
    const parts = user.full_name.split(' ');
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }
  return {
    firstName: user.firstName || null,
    lastName: user.lastName || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRole(user: any, role: 'admin' | 'teacher' | 'student') {
  const snake = `is_${role}`;
  const camel = `is${role.charAt(0).toUpperCase() + role.slice(1)}`;
  return user[snake] ?? user[camel] ?? false;
}
