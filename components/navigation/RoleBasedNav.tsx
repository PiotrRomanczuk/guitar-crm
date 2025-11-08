'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: string;
  requiresRole?: 'admin' | 'teacher' | 'student';
}

function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon && <span className="hidden sm:inline">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
}

export function RoleBasedNav({
  user,
  isAdmin,
  isTeacher,
  isStudent,
}: {
  user: { email?: string } | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}) {
  if (!user) {
    return null;
  }

  const navItems: NavLinkProps[] = [{ href: '/', label: 'Home', icon: '🏠' }];

  // Admin gets all access
  if (isAdmin) {
    navItems.push(
      { href: '/dashboard/admin', label: 'Admin', icon: '⚙️' },
      { href: '/dashboard/admin/users', label: 'User Management', icon: '👥' },
      { href: '/dashboard/songs', label: 'Songs', icon: '🎵' }
    );
  }

  // Teacher navigation
  if (isTeacher && !isAdmin) {
    navItems.push({ href: '/teacher', label: 'Teacher Dashboard', icon: '👨‍🏫' });
    // TODO: Implement these routes
    // { href: '/students', label: 'Students', icon: '👨‍🎓' },
    // { href: '/lessons', label: 'Lessons', icon: '📚' }
  }

  // Student navigation
  if (isStudent && !isAdmin && !isTeacher) {
    navItems.push({ href: '/student', label: 'Student Dashboard', icon: '👨‍🎓' });
    // TODO: Implement these routes
    // { href: '/my-lessons', label: 'My Lessons', icon: '📖' },
    // { href: '/progress', label: 'My Progress', icon: '📈' }
  }

  // Everyone can access songs, lessons, and assignements (if not admin - admins already have it)
  if (!isAdmin) {
    navItems.push({ href: '/dashboard/songs', label: 'Songs', icon: '🎵' });
    navItems.push({ href: '/dashboard/lessons', label: 'Lessons', icon: '📚' });
    navItems.push({ href: '/dashboard/assignments', label: 'Assignments', icon: '📋' });
  }

  // Everyone can access Profile and Settings
  navItems.push(
    { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' }
  );

  return (
    <nav className="flex flex-row flex-wrap gap-1 md:gap-2 lg:gap-3">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
