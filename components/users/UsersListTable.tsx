'use client';

import Link from 'next/link';

interface UserProfile {
  id: number;
  user_id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  isAdmin: boolean;
  isTeacher: boolean | null;
  isStudent: boolean | null;
  isActive: boolean;
  created_at: string | null;
}

interface UsersListTableProps {
  users: UserProfile[];
  onDelete: (id: number, email: string) => void;
}

function getRoleDisplay(user: UserProfile): string {
  const roles = [];
  if (user.isAdmin) roles.push('Admin');
  if (user.isTeacher) roles.push('Teacher');
  if (user.isStudent) roles.push('Student');
  return roles.length > 0 ? roles.join(', ') : 'No Role';
}

function getInitials(firstName: string | null, lastName: string | null): string {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
}

function UserRow({ user, onDelete }: { user: UserProfile; onDelete: (id: number, email: string) => void }) {
  return (
    <tr
      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      data-testid={`user-row-${user.id}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'N/A'}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {getRoleDisplay(user)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <Link
            href={`/dashboard/users/${user.id}`}
            className="px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            data-testid={`view-user-${user.id}`}
          >
            View
          </Link>
          <Link
            href={`/dashboard/users/${user.id}/edit`}
            className="px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            data-testid={`edit-user-${user.id}`}
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(user.id, user.email || 'User')}
            className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            data-testid={`delete-user-${user.id}`}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function UsersListTable({ users, onDelete }: UsersListTableProps) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <table className="w-full" data-testid="users-table">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
