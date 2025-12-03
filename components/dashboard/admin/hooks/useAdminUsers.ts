'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';
import type { User } from '@/schemas/UserSchema';

interface LoadUsersParams {
  search?: string;
}

async function loadAdminUsers(params: LoadUsersParams): Promise<User[]> {
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

  // Add search filter if provided
  if (params.search && params.search.trim()) {
    query = query.or(
      `firstName.ilike.%${params.search}%,lastName.ilike.%${params.search}%,email.ilike.%${params.search}%`
    );
  }

  const { data, error: fetchError } = await query.range(0, 49); // Limit to 50 users

  if (fetchError) {
    throw new Error('Failed to load users');
  }

  return data || [];
}

interface CreateUserPayload {
  userData: Partial<User>;
}

async function createAdminUser(payload: CreateUserPayload): Promise<void> {
  const { error: createError } = await supabase.from('profiles').insert([payload.userData]);

  if (createError) {
    throw new Error('Failed to create user');
  }
}

interface UpdateUserPayload {
  userId: string;
  userData: Partial<User>;
}

async function updateAdminUser(payload: UpdateUserPayload): Promise<void> {
  const { error: updateError } = await supabase
    .from('profiles')
    .update(payload.userData)
    .eq('id', payload.userId);

  if (updateError) {
    throw new Error('Failed to update user');
  }
}

interface DeleteUserPayload {
  userId: string;
}

async function deleteAdminUser(payload: DeleteUserPayload): Promise<void> {
  const { error: deleteError } = await supabase
    .from('profiles')
    .update({ isActive: false })
    .eq('id', payload.userId);

  if (deleteError) {
    throw new Error('Failed to delete user');
  }
}

export function useAdminUsers(initialUsers: User[], initialError: string | null) {
  const [searchQuery, setSearchQuery] = useState('');

  // Query for fetching users with dynamic search
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', { search: searchQuery }],
    queryFn: () => loadAdminUsers({ search: searchQuery }),
    initialData: initialUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for creating user
  const { mutate: createMutation, isPending: createPending } = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation for updating user
  const { mutate: updateMutation, isPending: updatePending } = useMutation({
    mutationFn: updateAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Mutation for deleting user
  const { mutate: deleteMutation, isPending: deletePending } = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateUser = (userData: Partial<User>) => {
    createMutation({ userData });
  };

  const handleUpdateUser = (user: User, userData: Partial<User>) => {
    if (!user.id) return;
    updateMutation({ userId: user.id.toString(), userData });
  };

  const handleDeleteUser = (user: User) => {
    if (!user.id) return;
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }
    deleteMutation({ userId: user.id.toString() });
  };

  const loading = isLoading || createPending || updatePending || deletePending;

  return {
    users,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load users') : initialError,
    searchQuery,
    handleSearch,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
  };
}
