'use client';

import { useState } from 'react';
import Link from 'next/link';
import UsersListFilters from './UsersListFilters';
import UsersListTable from './UsersListTable';
import { useUsersList } from './useUsersList';

export default function UsersList() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'' | 'admin' | 'teacher' | 'student'>('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');

  const { users, loading, error, refetch } = useUsersList(search, roleFilter, activeFilter);

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleReset = () => {
    setSearch('');
    setRoleFilter('');
    setActiveFilter('');
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <Link
          href="/dashboard/users/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-fit"
          data-testid="create-user-button"
        >
          + New User
        </Link>
      </div>

      <UsersListFilters
        search={search}
        roleFilter={roleFilter}
        activeFilter={activeFilter}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
        onActiveFilterChange={setActiveFilter}
        onReset={handleReset}
      />

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No users found</p>
          <Link
            href="/dashboard/users/new"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Create First User
          </Link>
        </div>
      ) : (
        <UsersListTable users={users} onDelete={handleDelete} />
      )}
    </div>
  );
}
