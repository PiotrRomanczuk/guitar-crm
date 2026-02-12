'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  History,
  Users,
  Calendar,
  Settings,
  type LucideIcon,
} from 'lucide-react';

/** Track scroll direction to auto-hide bottom nav on scroll down */
function useScrollDirection() {
  const [visible, setVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const threshold = 10;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 0) {
        setVisible(true);
      } else if (currentY - lastScrollY.current > threshold) {
        setVisible(false); // scrolling down
      } else if (lastScrollY.current - currentY > threshold) {
        setVisible(true); // scrolling up
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visible;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Optional: paths that should also highlight this nav item */
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    matchPaths: ['/dashboard'],
  },
  {
    href: '/dashboard/lessons',
    label: 'History',
    icon: History,
    matchPaths: ['/dashboard/lessons'],
  },
  {
    href: '/dashboard/students',
    label: 'Students',
    icon: Users,
    matchPaths: ['/dashboard/students', '/dashboard/users'],
  },
  {
    href: '/dashboard/calendar',
    label: 'Calendar',
    icon: Calendar,
    matchPaths: ['/dashboard/calendar'],
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    matchPaths: ['/dashboard/settings'],
  },
];

interface MobileBottomNavProps {
  className?: string;
}

/**
 * Fixed bottom navigation bar for mobile devices
 * Shows 5 tabs: Dashboard, History, Students, Calendar, Settings
 */
function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const visible = useScrollDirection();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => pathname?.startsWith(path));
    }
    return pathname === item.href;
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-card/95 backdrop-blur-md border-t border-border',
        'pb-safe md:hidden', // Only show on mobile, with safe area padding
        'transition-transform duration-300 ease-in-out',
        !visible && 'translate-y-full',
        className
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  active && 'scale-110'
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
              {/* Active indicator dot */}
              {active && (
                <span
                  className="absolute bottom-2 h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileBottomNav };
