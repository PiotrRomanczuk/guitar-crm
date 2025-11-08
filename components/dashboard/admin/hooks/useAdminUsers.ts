import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/schemas/UserSchema';

export function useAdminUsers(initialUsers: User[], initialError: string | null) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [searchQuery, setSearchQuery] = useState('');

  // Load users (for search functionality)
  const loadUsers = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

      // Add search filter if provided
      if (search && search.trim()) {
        query = query.or(
          `firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      const { data, error: fetchError } = await query.range(0, 49); // Limit to 50 users

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    loadUsers(query);
  };

  // Handle create user
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      const { error: createError } = await supabase.from('profiles').insert([userData]);

      if (createError) {
        throw createError;
      }

      await loadUsers(searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async (user: User, userData: Partial<User>) => {
    try {
      setLoading(true);
      const { error: updateError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      await loadUsers(searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('profiles')
        .update({ isActive: false })
        .eq('id', user.id);

      if (deleteError) {
        throw deleteError;
      }

      await loadUsers(searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    searchQuery,
    handleSearch,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  };
}
