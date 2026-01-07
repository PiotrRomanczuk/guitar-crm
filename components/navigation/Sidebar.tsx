'use client';

import {
  Users,
  Music,
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  Settings,
  LogOut,
  Guitar,
  Menu,
  LucideIcon,
  BarChart,
  FileText,
  Music2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { DatabaseStatus } from '@/components/debug/DatabaseStatus';

interface SidebarProps {
  user: { email?: string } | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function Sidebar({ user, isAdmin, isTeacher, isStudent }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Force a full page reload to clear all client-side state and cookies
    window.location.href = '/sign-in';
  };

  if (!user) return null;

  const getMenuItems = () => {
    const items = [{ id: 'home', label: 'Home', icon: LayoutDashboard, path: '/dashboard' }];

    if (isAdmin || isTeacher) {
      items.push(
        { id: 'songs', label: 'Songs', icon: Music, path: '/dashboard/songs' },
        { id: 'lessons', label: 'Lessons', icon: BookOpen, path: '/dashboard/lessons' },
        {
          id: 'assignments',
          label: 'Assignments',
          icon: ClipboardList,
          path: '/dashboard/assignments',
        },
        { id: 'users', label: 'Users', icon: Users, path: '/dashboard/users' },
        {
          id: 'song-stats',
          label: 'Song Stats',
          icon: BarChart,
          path: '/dashboard/admin/stats/songs',
        },
        {
          id: 'lesson-stats',
          label: 'Lesson Stats',
          icon: BarChart,
          path: '/dashboard/admin/stats/lessons',
        },
        {
          id: 'spotify-matches',
          label: 'Spotify Matches',
          icon: Music2,
          path: '/dashboard/admin/spotify-matches',
        },
        { id: 'logs', label: 'Activity Logs', icon: FileText, path: '/dashboard/logs' }
      );
    } else if (isStudent) {
      items.push(
        { id: 'my-songs', label: 'My Songs', icon: Music, path: '/dashboard/songs' },
        { id: 'my-lessons', label: 'My Lessons', icon: BookOpen, path: '/dashboard/lessons' },
        {
          id: 'my-assignments',
          label: 'My Assignments',
          icon: ClipboardList,
          path: '/dashboard/assignments',
        },
        { id: 'my-stats', label: 'My Stats', icon: BarChart, path: '/dashboard/stats' }
      );
    }
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col z-30">
        <SidebarContent
          menuItems={menuItems}
          pathname={pathname}
          setIsOpen={setIsOpen}
          handleSignOut={handleSignOut}
          isAdmin={isAdmin}
          isTeacher={isTeacher}
          isStudent={isStudent}
        />
      </aside>

      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent
              menuItems={menuItems}
              pathname={pathname}
              setIsOpen={setIsOpen}
              handleSignOut={handleSignOut}
              isAdmin={isAdmin}
              isTeacher={isTeacher}
              isStudent={isStudent}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

interface SidebarContentProps {
  menuItems: { id: string; label: string; icon: LucideIcon; path: string }[];
  pathname: string;
  setIsOpen: (open: boolean) => void;
  handleSignOut: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

function SidebarContent({
  menuItems,
  pathname,
  setIsOpen,
  handleSignOut,
  isAdmin,
  isTeacher,
  isStudent,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Guitar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">GuitarStudio</h1>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? 'Admin' : isTeacher ? 'Teacher' : isStudent ? 'Student' : 'User'} Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => {
          const isActive =
            pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                'opacity-0 animate-fade-in',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-1">
        <div className="px-4 py-2">
          <DatabaseStatus variant="inline" className="w-full justify-center" />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
