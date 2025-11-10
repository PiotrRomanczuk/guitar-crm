import { supabase } from '@/lib/supabase';
import UserForm from '@/components/users/UserForm';

export const metadata = {
  title: 'Edit User',
  description: 'Edit user information',
};

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', parseInt(params.id))
    .single();

  if (error || !user) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
        User not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit User</h1>
        <p className="text-gray-600 dark:text-gray-400">Update user information</p>
      </div>
      <UserForm initialData={user} isEdit={true} />
    </div>
  );
}
