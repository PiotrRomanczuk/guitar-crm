import UsersList from '@/components/users/UsersList';

export const metadata = {
  title: 'Users',
  description: 'Manage users in the system',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system users and their roles</p>
      </div>
      <UsersList />
    </div>
  );
}
