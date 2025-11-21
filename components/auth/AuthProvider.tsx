'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isStudent, setIsStudent] = useState(false);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const fetchUserRoles = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, is_teacher, is_student')
          .eq('id', userId)
          .single();

        if (profile) {
          setIsAdmin(profile.is_admin || false);
          setIsTeacher(profile.is_teacher || false);
          setIsStudent(profile.is_student || false);
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          await fetchUserRoles(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    void getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        await fetchUserRoles(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsTeacher(false);
        setIsStudent(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    isTeacher,
    isStudent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
