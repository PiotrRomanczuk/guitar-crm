'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserDetailProps {
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    is_admin: boolean;
    is_teacher: boolean;
    is_student: boolean;
    avatar_url: string | null;
    notes: string | null;
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
    if (user.is_admin) roles.push('Admin');
    if (user.is_teacher) roles.push('Teacher');
    if (user.is_student) roles.push('Student');
    return roles.length ? roles : ['No Role'];
  };

  const fullName = user.full_name || 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* User Header with Avatar */}
      <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {fullName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span>✉️</span>
            {user.email}
          </p>

          {/* Roles Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {getRolesBadges().map((role) => (
              <span
                key={role}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  role === 'Admin'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    : role === 'Teacher'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : role === 'Student'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
                data-testid={`role-badge-${role.toLowerCase()}`}
              >
                {role === 'Admin' && '👑'} {role === 'Teacher' && '👨‍🏫'} {role === 'Student' && '👨‍🎓'}{' '}
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-400 flex items-center gap-2">
            <span>👤</span> Full Name
          </label>
          <p className="text-gray-900 dark:text-white">{user.full_name || 'N/A'}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-400 flex items-center gap-2">
            <span>✉️</span> Email
          </label>
          <p className="text-gray-900 dark:text-white">{user.email || 'N/A'}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-400 flex items-center gap-2">
            <span>✅</span> Status
          </label>
          <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
            Active
          </span>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-400 flex items-center gap-2">
            <span>📝</span> Notes
          </label>
          <p className="text-gray-900 dark:text-white">{user.notes || 'No notes added'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Link href={`/dashboard/users/${user.id}/edit`}>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg">
            ✏️ Edit Profile
          </button>
        </Link>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-6 py-2.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
        >
          {loading ? '⏳ Deleting...' : '🗑️ Delete User'}
        </button>
        <Link href="/dashboard/users">
          <button className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            ← Back to Users
          </button>
        </Link>
      </div>
    </div>
  );
}
