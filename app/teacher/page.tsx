'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function TeacherDashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage students, lessons, and track progress
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard title="Students" icon="👨‍🎓" href="/dashboard/users" label="View students" />
          <DashboardCard title="Lessons" icon="📚" href="/dashboard/lessons" label="View lessons" />
          <DashboardCard title="Songs" icon="🎵" href="/dashboard/songs" label="View songs" />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/lessons/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Create New Lesson
            </Link>
            <Link
              href="/dashboard/songs/new"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Add New Song
            </Link>
          </div>
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

export default function TeacherDashboard() {
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
          .select('isTeacher')
          .eq('id', user.id)
          .single();

        if (profile?.isTeacher) {
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

  return <TeacherDashboardContent />;
}
