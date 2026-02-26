'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  ClipboardList, Calendar, Settings, LogOut, BarChart,
  FileText, GraduationCap, Grid3X3, Zap, Users, type LucideIcon,
} from 'lucide-react';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from '@/components/ui/drawer';

interface MenuItem { id: string; label: string; icon: LucideIcon; path: string }

interface MobileMoreMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

function getMenuItems(isAdmin: boolean, isTeacher: boolean): MenuItem[] {
  const items: MenuItem[] = [
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/dashboard/assignments' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { id: 'theory', label: 'Theory', icon: GraduationCap, path: '/dashboard/theory' },
    { id: 'fretboard', label: 'Fretboard', icon: Grid3X3, path: '/dashboard/fretboard' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];
  if (isAdmin || isTeacher) {
    items.splice(4, 0,
      { id: 'skills', label: 'Skills', icon: Zap, path: '/dashboard/skills' },
      { id: 'cohorts', label: 'Cohorts', icon: Users, path: '/dashboard/cohorts' },
      { id: 'song-stats', label: 'Song Stats', icon: BarChart, path: '/dashboard/admin/stats/songs' },
      { id: 'lesson-stats', label: 'Lesson Stats', icon: BarChart, path: '/dashboard/admin/stats/lessons' },
      { id: 'logs', label: 'Activity Logs', icon: FileText, path: '/dashboard/logs' },
    );
  }
  return items;
}

export function MobileMoreMenu({ open, onOpenChange, isAdmin, isTeacher }: MobileMoreMenuProps) {
  const pathname = usePathname();
  const items = getMenuItems(isAdmin, isTeacher);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle>More</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-1">
          {items.map((item) => {
            const active = pathname === item.path
              || (item.path !== '/dashboard' && pathname?.startsWith(item.path));
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full min-h-[44px]',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full min-h-[44px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
