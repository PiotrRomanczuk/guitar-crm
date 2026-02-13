'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { HorizontalNav } from '@/components/navigation/HorizontalNav';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { NotificationBell } from '@/components/notifications';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { useLayoutMode } from '@/hooks/use-is-widescreen';
import { useKeyboardViewport } from '@/hooks/use-keyboard-viewport';

interface LayoutWrapperProps {
  children: ReactNode;
  user: { id?: string; email?: string } | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

/**
 * Client component that wraps page content with appropriate layout.
 * Children remain as Server Components due to React's composition model.
 *
 * Handles three layout modes:
 * 1. Auth pages: No navigation, just children
 * 2. Dashboard with sidebar (widescreen/tablet): AppSidebar + SidebarInset
 * 3. Dashboard mobile: HorizontalNav + children + MobileBottomNav
 */
export function LayoutWrapper({ children, user, isAdmin, isTeacher, isStudent }: LayoutWrapperProps) {
  const pathname = usePathname();
  const layoutMode = useLayoutMode();
  useKeyboardViewport();

  // Determine layout type
  const isAuthPage = ['/sign-in', '/sign-up', '/auth/login', '/auth/register'].includes(
    pathname || ''
  );
  const showNavigation = !!user && !isAuthPage;
  const useSidebar = showNavigation && (layoutMode === 'widescreen' || layoutMode === 'tablet');
  const useMobileNav = showNavigation && layoutMode === 'mobile';

  // Auth pages - no navigation, just children
  if (isAuthPage || !user) {
    return (
      <>
        <main className="min-h-screen bg-background">{children}</main>
        <Toaster />
      </>
    );
  }

  // Dashboard with sidebar (widescreen/tablet)
  if (useSidebar) {
    return (
      <SidebarProvider defaultOpen={layoutMode === 'widescreen'}>
        <AppSidebar isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
        <SidebarInset className="overflow-x-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
            <h2 className="text-lg font-semibold">
              {(() => {
                if (pathname === '/dashboard') return 'Dashboard';

                const segments = pathname?.split('/') || [];
                const lastSegment = segments.pop() || 'Page';

                // Check if last segment is a UUID
                const isUUID = lastSegment.length === 36 && lastSegment.split('-').length === 5;

                if (isUUID) {
                  const parentSegment = segments.pop();
                  return parentSegment
                    ? parentSegment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
                    : 'Details';
                }

                return lastSegment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
              })()}
            </h2>
            <NotificationBell userId={user?.id} />
          </header>
          <main className="flex-1 bg-background p-3 sm:p-4 md:p-6 lg:p-8 ultrawide:p-10 overflow-x-hidden w-full max-w-full">
            {children}
          </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    );
  }

  // Dashboard mobile - horizontal nav + bottom nav
  if (useMobileNav) {
    return (
      <>
        <HorizontalNav user={user} isAdmin={isAdmin} isTeacher={isTeacher} isStudent={isStudent} />
        <main className="pt-16 pb-24 md:pb-0 min-h-screen bg-background">{children}</main>
        <MobileBottomNav />
        <Toaster />
      </>
    );
  }

  // Fallback (shouldn't reach here)
  return (
    <>
      <main className="min-h-screen bg-background">{children}</main>
      <Toaster />
    </>
  );
}
