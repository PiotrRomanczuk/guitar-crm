'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function StudentDashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Student Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">View lessons and track progress</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="My Lessons"
            icon="📖"
            href="/dashboard/lessons"
            label="View lessons"
          />
          <DashboardCard
            title="Progress"
            icon="📈"
            href="/dashboard/lessons"
            label="View progress"
          />
          <DashboardCard
            title="Songs Library"
            icon="🎵"
            href="/dashboard/songs"
            label="View songs"
          />
        </div>

        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  My Assignments
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">—</p>
              </div>
              <span className="text-4xl">�</span>
            </div>
            <Link
              href="/dashboard/assignements"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
            >
              View assignments →
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📝 Need Help?
          </h2>
          <p className="text-blue-800 dark:text-blue-200">
            Contact your teacher or check settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  icon,
  href,
  label,
}: {
  title: string;
  icon: string;
  href: string;
  label: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">—</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
      <Link
        href={href}
        className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
      >
        {label} →
      </Link>
    </div>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkRole() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push('/sign-in');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('isStudent')
          .eq('id', user.id)
          .single();

        if (profile?.isStudent) {
          setHasAccess(true);
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Access denied.</p>
        </div>
      </div>
    );
  }

  return <StudentDashboardContent />;
}
