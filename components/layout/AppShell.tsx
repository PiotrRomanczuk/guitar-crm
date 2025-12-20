'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/navigation/Header';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Toaster } from 'sonner';
import { getSupabaseConfig } from '@/lib/supabase/config';

interface AppShellProps {
  children: React.ReactNode;
  user: { email?: string } | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function AppShell({ children, user, isAdmin, isTeacher, isStudent }: AppShellProps) {
  const pathname = usePathname();
  // Hide sidebar on auth pages even if user data is present (e.g. stale state during logout)
  const isAuthPage = ['/sign-in', '/sign-up', '/auth/login', '/auth/register'].includes(
    pathname || ''
  );
  const showSidebar = !!user && !isAuthPage;

  const { isLocal } = getSupabaseConfig();
  console.log('AppShell:', {
    pathname,
    hasUser: !!user,
    isAuthPage,
    showSidebar,
    db: isLocal ? 'local' : 'remote',
  });

  return (
    <>
      {showSidebar ? (
        <Sidebar user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
      ) : (
        <Header user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
      )}
      <main
        className={
          showSidebar ? 'md:ml-64 min-h-screen bg-background' : 'min-h-screen bg-background'
        }
      >
        {children}
      </main>
      <Toaster />
    </>
  );
}
