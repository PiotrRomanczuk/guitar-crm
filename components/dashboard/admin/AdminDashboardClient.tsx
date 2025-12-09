'use client';

import { useState } from 'react';
import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';
import { AdminActionCard } from '@/components/dashboard/admin/AdminActionCard';
import { RecentActivity } from '@/components/dashboard/admin/RecentActivity';
import { CalendarEventsList } from '@/components/dashboard/calendar/CalendarEventsList';
import { PotentialUsersList } from '@/components/dashboard/admin/PotentialUsersList';
import { BearerTokenDisplay } from '@/components/dashboard/BearerTokenDisplay';

type DebugView = 'admin' | 'teacher' | 'student';

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalSongs: number;
    totalLessons: number;
    recentUsers: RecentUser[];
  };
}

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const [debugView, setDebugView] = useState<DebugView>('admin');

  const getBackgroundColor = () => {
    switch (debugView) {
      case 'teacher':
        return 'from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800';
      case 'student':
        return 'from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800';
      default:
        return 'from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800';
    }
  };

  const getHeader = () => {
    switch (debugView) {
      case 'teacher':
        return {
          icon: '👨‍🏫',
          title: 'Teacher Dashboard Preview',
          description: 'Preview of teacher dashboard (debug mode)',
        };
      case 'student':
        return {
          icon: '👨‍🎓',
          title: 'Student Dashboard Preview',
          description: 'Preview of student dashboard (debug mode)',
        };
      default:
        return {
          icon: '⚙️',
          title: 'Admin Dashboard',
          description: 'System administration and user management',
        };
    }
  };

  const header = getHeader();

  return (
    <div className={`min-h-screen bg-linear-to-br ${getBackgroundColor()}`}>
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <DebugViewBanner debugView={debugView} onReset={() => setDebugView('admin')} />

        <BearerTokenDisplay />

        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {header.icon} {header.title}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
            {header.description}
          </p>
        </header>

        <QuickStats
          debugView={debugView}
          totalUsers={stats.totalUsers}
          totalTeachers={stats.totalTeachers}
          totalStudents={stats.totalStudents}
          totalSongs={stats.totalSongs}
        />
        {debugView === 'admin' && <AdminActions />}
        {debugView === 'admin' && (
          <div className="mb-6 sm:mb-8">
            <CalendarEventsList limit={7} />
          </div>
        )}
        {debugView === 'admin' && (
          <div className="mb-6 sm:mb-8">
            <PotentialUsersList />
          </div>
        )}
        {debugView === 'admin' && <RecentActivity recentUsers={stats.recentUsers} />}

        {debugView === 'admin' && (
          <DebugViewSelector currentView={debugView} onViewChange={setDebugView} />
        )}
      </main>
    </div>
  );
}

function DebugViewBanner({ debugView, onReset }: { debugView: DebugView; onReset: () => void }) {
  if (debugView === 'admin') return null;

  return (
    <div className="mb-4 p-4 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded-lg">
      <p className="text-amber-800 dark:text-amber-200 font-medium">
        🔧 Debug Mode: Viewing as{' '}
        <span className="font-bold">{debugView === 'teacher' ? 'Teacher' : 'Student'}</span>
      </p>
      <button
        onClick={onReset}
        className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
      >
        Back to Admin View
      </button>
    </div>
  );
}

function DebugViewSelector({
  currentView,
  onViewChange,
}: {
  currentView: DebugView;
  onViewChange: (view: DebugView) => void;
}) {
  return (
    <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
        🔧 Debug: Preview Dashboards
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Switch between dashboard views to test different user role perspectives:
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onViewChange('admin')}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentView === 'admin'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          ⚙️ Admin View
        </button>
        <button
          onClick={() => onViewChange('teacher')}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentView === 'teacher'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          👨‍🏫 Teacher View
        </button>
        <button
          onClick={() => onViewChange('student')}
          className={`px-4 py-2 rounded-md transition-colors ${
            currentView === 'student'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          👨‍🎓 Student View
        </button>
      </div>
    </div>
  );
}

function QuickStats({
  debugView,
  totalUsers,
  totalTeachers,
  totalStudents,
  totalSongs,
}: {
  debugView: DebugView;
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalSongs: number;
}) {
  const getStats = () => {
    switch (debugView) {
      case 'teacher':
        return [
          { icon: '👨‍🎓', value: '0', label: 'My Students' },
          { icon: '🎯', value: '0', label: 'Active Lessons' },
          { icon: '🎵', value: totalSongs.toString(), label: 'Songs Library' },
          { icon: '📊', value: '0', label: 'Student Progress' },
        ];
      case 'student':
        return [
          { icon: '👨‍🏫', value: '0', label: 'My Teacher' },
          { icon: '📅', value: '0', label: 'Lessons Done' },
          { icon: '🎵', value: '0', label: 'Songs Learning' },
          { icon: '⭐', value: '0%', label: 'Progress' },
        ];
      default:
        return [
          { icon: '👥', value: totalUsers.toString(), label: 'Total Users' },
          { icon: '👨‍🏫', value: totalTeachers.toString(), label: 'Teachers' },
          { icon: '👨‍🎓', value: totalStudents.toString(), label: 'Students' },
          { icon: '🎵', value: totalSongs.toString(), label: 'Songs' },
        ];
    }
  };

  const statsConfig = getStats();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {statsConfig.map((stat) => (
        <AdminStatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
      ))}
    </div>
  );
}

function AdminActions() {
  const actions = [
    {
      href: '/admin/users',
      icon: '👥',
      title: 'User Management',
      description: 'Create, edit, and manage user accounts and roles',
      linkText: 'Manage Users',
      comingSoon: false,
    },
    {
      href: '/admin/settings',
      icon: '⚙️',
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      linkText: 'Open Settings',
      comingSoon: true,
    },
    {
      href: '/admin/reports',
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'View system usage and performance metrics',
      linkText: 'View Reports',
      comingSoon: true,
    },
    {
      href: '/admin/database',
      icon: '💾',
      title: 'Database Management',
      description: 'Backup, restore, and maintain database',
      linkText: 'Manage Database',
      comingSoon: true,
    },
    {
      href: '/admin/logs',
      icon: '📝',
      title: 'Activity Logs',
      description: 'Monitor system activity and user actions',
      linkText: 'View Logs',
      comingSoon: true,
    },
    {
      href: '/admin/security',
      icon: '🔒',
      title: 'Security & Permissions',
      description: 'Manage RLS policies and access control',
      linkText: 'Security Settings',
      comingSoon: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {actions.map((action) => (
        <AdminActionCard key={action.href} {...action} />
      ))}
    </div>
  );
}

// RecentActivity is intentionally extracted to reduce file size and improve readability.
