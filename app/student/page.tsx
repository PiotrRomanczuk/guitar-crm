'use client';

import { RequireStudent } from '@/components/auth';
import { StudentDashboardStats } from '@/components/dashboard/student/StudentDashboardStats';
import { StudentRecentLessons } from '@/components/dashboard/student/StudentRecentLessons';
import { StudentProgressOverview } from '@/components/dashboard/student/StudentProgressOverview';
import { StudentUpcomingLessons } from '@/components/dashboard/student/StudentUpcomingLessons';

export default function StudentDashboard() {
	return (
		<RequireStudent>
			<div className='min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800'>
				<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl'>
					<header className='mb-6 sm:mb-8'>
						<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2'>
							🎵 Your Learning Dashboard
						</h1>
						<p className='text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300'>
							Track your progress and manage your lessons
						</p>
					</header>

					<StudentDashboardStats />
					<StudentUpcomingLessons />
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8'>
						<StudentRecentLessons />
						<StudentProgressOverview />
					</div>
				</main>
			</div>
		</RequireStudent>
	);
}
