'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth state with role flags
 * Follows CLAUDE.md Standards (Section 6)
 */
export interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * useAuth - Client-side auth hook with role checking
 *
 * Returns the current user and their roles.
 * Updates automatically when auth state changes.
 *
 * @example
 * ```tsx
 * const { user, isAdmin, isTeacher, isStudent, isLoading } = useAuth();
 *
 * if (isLoading) return <Spinner />;
 * if (!user) return <Redirect to="/login" />;
 * if (!isAdmin) return <AccessDenied />;
 * ```
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    isTeacher: false,
    isStudent: false,
    isLoading: true,
    error: null,
  });

  const fetchRoles = useCallback(async (user: User) => {
    const supabase = createClient();

    try {
      // First try user_roles table
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!rolesError && roles && roles.length > 0) {
        return {
          isAdmin: roles.some((r) => r.role === 'admin'),
          isTeacher: roles.some((r) => r.role === 'teacher'),
          isStudent: roles.some((r) => r.role === 'student'),
        };
      }

      // Fallback to profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, is_teacher, is_student')
        .eq('id', user.id)
        .single();

      if (profile) {
        return {
          isAdmin: profile.is_admin ?? false,
          isTeacher: profile.is_teacher ?? false,
          isStudent: profile.is_student ?? false,
        };
      }

      // Default: no roles
      return { isAdmin: false, isTeacher: false, isStudent: false };
    } catch (err) {
      console.error('[useAuth] Error fetching roles:', err);
      return { isAdmin: false, isTeacher: false, isStudent: false };
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error) {
          setState({
            user: null,
            isAdmin: false,
            isTeacher: false,
            isStudent: false,
            isLoading: false,
            error: error.message,
          });
          return;
        }

        if (!user) {
          setState({
            user: null,
            isAdmin: false,
            isTeacher: false,
            isStudent: false,
            isLoading: false,
            error: null,
          });
          return;
        }

        const roles = await fetchRoles(user);

        if (!mounted) return;

        setState({
          user,
          ...roles,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (!mounted) return;

        setState({
          user: null,
          isAdmin: false,
          isTeacher: false,
          isStudent: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Auth error',
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setState({
            user: null,
            isAdmin: false,
            isTeacher: false,
            isStudent: false,
            isLoading: false,
            error: null,
          });
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setState((prev) => ({ ...prev, isLoading: true }));
          const roles = await fetchRoles(session.user);

          if (!mounted) return;

          setState({
            user: session.user,
            ...roles,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRoles]);

  return state;
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: 'admin' | 'teacher' | 'student'): boolean {
  const auth = useAuth();

  switch (role) {
    case 'admin':
      return auth.isAdmin;
    case 'teacher':
      return auth.isTeacher;
    case 'student':
      return auth.isStudent;
    default:
      return false;
  }
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: Array<'admin' | 'teacher' | 'student'>): boolean {
  const auth = useAuth();

  return roles.some((role) => {
    switch (role) {
      case 'admin':
        return auth.isAdmin;
      case 'teacher':
        return auth.isTeacher;
      case 'student':
        return auth.isStudent;
      default:
        return false;
    }
  });
}
