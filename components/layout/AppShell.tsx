'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/navigation/Header';
import { HorizontalNav } from '@/components/navigation/HorizontalNav';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { Toaster } from 'sonner';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsWidescreen } from '@/hooks/use-is-widescreen';
import { Separator } from '@/components/ui/separator';

interface AppShellProps {
  children: React.ReactNode;
  user: { email?: string } | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function AppShell({ children, user, isAdmin, isTeacher, isStudent }: AppShellProps) {
  const pathname = usePathname();
  const isWidescreen = useIsWidescreen();

  // Hide sidebar on auth pages even if user data is present (e.g. stale state during logout)
  const isAuthPage = ['/sign-in', '/sign-up', '/auth/login', '/auth/register'].includes(
    pathname || ''
  );
  const showNavigation = !!user && !isAuthPage;

  // Use sidebar on widescreen displays, horizontal nav on vertical/narrow displays
  const useSidebar = showNavigation && isWidescreen;
  const useHorizontalNav = showNavigation && !isWidescreen;

  const { isLocal } = getSupabaseConfig();
  console.log('AppShell:', {
    pathname,
    hasUser: !!user,
    isAuthPage,
    showNavigation,
    isWidescreen,
    useSidebar,
    useHorizontalNav,
    db: isLocal ? 'local' : 'remote',
  });

  // Auth pages - no navigation
  if (isAuthPage || !user) {
    return (
      <>
        <Header user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
        <main className="min-h-screen bg-background">{children}</main>
        <Toaster />
      </>
    );
  }

  // Widescreen displays with sidebar
  if (useSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
        <SidebarInset className="overflow-x-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 flex-1">
              <h2 className="text-sm font-semibold">
                {pathname === '/dashboard'
                  ? 'Dashboard'
                  : pathname
                      ?.split('/')
                      .pop()
                      ?.replace(/-/g, ' ')
                      .replace(/^\w/, (c) => c.toUpperCase()) || 'Page'}
              </h2>
            </div>
          </header>
          <main className="flex-1 bg-background p-4 md:p-6 lg:p-8 overflow-x-hidden w-full max-w-full">
            {children}
          </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    );
  }

  // Vertical/narrow displays with top horizontal nav
  return (
    <>
      <HorizontalNav user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
      <main className="pt-16 min-h-screen bg-background">{children}</main>
      <Toaster />
    </>
  );
}
