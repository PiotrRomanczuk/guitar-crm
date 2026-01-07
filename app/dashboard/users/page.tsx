import { UsersList } from '@/components/users';

export const metadata = {
  title: 'Users',
  description: 'Manage users in the system',
};

export default function UsersPage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      <div className="space-y-4 sm:space-y-6 opacity-0 animate-fade-in">
        <UsersList />
      </div>
    </div>
  );
}
