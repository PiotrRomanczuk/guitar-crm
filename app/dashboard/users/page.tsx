import { UsersList } from '@/components/users';

export const metadata = {
  title: 'Users',
  description: 'Manage users in the system',
};

export default function UsersPage() {
  return (
    <div className="space-y-6 opacity-0 animate-fade-in">
      <UsersList />
    </div>
  );
}
