'use client';

import { RequireTeacher } from '@/components/auth';
import { TeacherDashboardStats } from '@/components/teacher/TeacherDashboardStats';
import { TeacherStudentsList } from '@/components/teacher/TeacherStudentsList';
import { TeacherRecentLessons } from '@/components/teacher/TeacherRecentLessons';
import { TeacherLessonSchedule } from '@/components/teacher/TeacherLessonSchedule';

export default function TeacherDashboard() {
	return (
		<RequireTeacher>
			<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
				<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl'>
					<header className='mb-6 sm:mb-8'>
						<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2'>
							👨‍🏫 Teacher Dashboard
						</h1>
						<p className='text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300'>
							Manage your students, lessons, and progress tracking
						</p>
					</header>

					<TeacherDashboardStats />
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8'>
						<div className='lg:col-span-2'>
							<TeacherStudentsList />
						</div>
						<div>
							<TeacherLessonSchedule />
						</div>
					</div>
					<TeacherRecentLessons />
				</main>
			</div>
		</RequireTeacher>
	);
}
