import { createClient } from '@/lib/supabase/server';
import UserDetail from '@/components/users/UserDetail';
import { getStudentRepertoire, getStudentAssignments } from './actions';
import { StudentRepertoire } from '@/components/users/StudentRepertoire';
import { StudentAssignments } from '@/components/users/StudentAssignments';

export const metadata = {
  title: 'User Detail',
  description: 'View user details',
};

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: user, error } = await supabase.from('profiles').select('*').eq('id', id).single();

  if (error || !user) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
        User not found
      </div>
    );
  }

  const transformedUser = transformUser(user);

  // Fetch repertoire if the user is a student
  const isStudent = transformedUser.isStudent;
  const repertoire = isStudent ? await getStudentRepertoire(id) : [];
  const assignments = isStudent ? await getStudentAssignments(id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Detail</h1>
      </div>
      <UserDetail user={transformedUser} />

      {isStudent && (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assignments</h2>
            <StudentAssignments assignments={assignments} />
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Repertoire</h2>
            <StudentRepertoire repertoire={repertoire} />
          </div>
        </>
      )}
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
