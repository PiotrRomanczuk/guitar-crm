'use client';

import { useState } from 'react';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { Button } from '@/components/ui/button';
import { useAdminUsers } from './hooks/useAdminUsers';
import type { User } from '@/schemas/UserSchema';

interface AdminUsersClientProps {
  initialUsers: User[];
  initialError: string | null;
}

export function AdminUsersClient({ initialUsers, initialError }: AdminUsersClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    users,
    loading,
    error,
    handleSearch,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  } = useAdminUsers(initialUsers, initialError);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleCreate = async (userData: Partial<User>) => {
    await handleCreateUser(userData);
    setShowCreateForm(false);
  };

  const handleUpdate = async (userData: Partial<User>) => {
    await handleUpdateUser(editingUser!, userData);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            👥 User Management
          </h1>
          <p className="text-xs sm:text-base lg:text-lg text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="font-semibold text-destructive text-sm sm:text-base">
              Error Loading Users
            </p>
            <p className="text-destructive mt-1 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {loading
              ? 'Loading users...'
              : `${users.length} user${users.length !== 1 ? 's' : ''} found`}
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
            Create User
          </Button>
        </div>

        <UserList
          users={users}
          loading={loading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onSearch={handleSearch}
        />

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border">
              <UserForm
                mode="create"
                onSubmit={handleCreate}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border">
              <UserForm
                mode="edit"
                user={editingUser}
                onSubmit={handleUpdate}
                onCancel={() => setEditingUser(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
