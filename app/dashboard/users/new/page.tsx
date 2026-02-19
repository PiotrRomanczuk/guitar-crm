import { UserForm } from '@/components/users';

export const metadata = {
  title: 'Create User',
  description: 'Create a new user account',
};

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create User</h1>
        <p className="text-gray-600 dark:text-gray-400">Add a new user to the system</p>
      </div>
      <UserForm />
    </div>
  );
}
