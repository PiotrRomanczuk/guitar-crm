import { useState, useEffect } from 'react';

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

export function useUsersList(
  search: string,
  roleFilter: '' | 'admin' | 'teacher' | 'student',
  activeFilter: '' | 'true' | 'false'
) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (roleFilter) params.append('role', roleFilter);
        if (activeFilter) params.append('active', activeFilter);

        const res = await fetch(`/api/users?${params}`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const result = await res.json();
        setUsers(result.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search, roleFilter, activeFilter]);

  const refetch = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (roleFilter) params.append('role', roleFilter);
    if (activeFilter) params.append('active', activeFilter);

    const res = await fetch(`/api/users?${params}`);
    if (res.ok) {
      const result = await res.json();
      setUsers(result.data || []);
    }
  };

  return {
    users,
    loading,
    error,
    refetch,
  };
}
