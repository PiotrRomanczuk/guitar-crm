'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserDetailProps {
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    username: string | null;
    isAdmin: boolean;
    isTeacher: boolean | null;
    isStudent: boolean | null;
    isActive: boolean;
  };
}

export default function UserDetail({ user }: UserDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete user ${user.email}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/dashboard/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const getRolesBadges = () => {
    const roles = [];
    if (user.isAdmin) roles.push('Admin');
    if (user.isTeacher) roles.push('Teacher');
    if (user.isStudent) roles.push('Student');
    return roles.length ? roles : ['No Role'];
  };

  const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'N/A';

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
      {/* User Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">First Name</label>
          <p className="text-gray-900 dark:text-white">{user.firstName || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Last Name</label>
          <p className="text-gray-900 dark:text-white">{user.lastName || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Username</label>
          <p className="text-gray-900 dark:text-white">{user.username || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Status</label>
          <p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}
              data-testid="status-badge"
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
      </div>

      {/* Roles */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-400 block mb-2">Roles</label>
        <div className="flex flex-wrap gap-2">
          {getRolesBadges().map((role) => (
            <span
              key={role}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
              data-testid={`role-badge-${role.toLowerCase()}`}
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Link href={`/dashboard/users/${user.id}/edit`}>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Edit
          </button>
        </Link>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
        <Link href="/dashboard/users">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Back
          </button>
        </Link>
      </div>
    </div>
  );
}
