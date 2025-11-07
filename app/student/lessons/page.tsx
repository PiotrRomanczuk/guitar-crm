'use client';

import { RequireStudent } from '@/components/auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lesson {
	id: string;
	date: string;
	start_time: string;
	title?: string;
	status: string;
	teacher_profile?: { full_name: string | null };
}

function LessonCard({ lesson }: { lesson: Lesson }) {
	return (
		<Link href={`/student/lessons/${lesson.id}`}>
			<div
				className='bg-white dark:bg-gray-700 p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer'
				data-testid='lesson-card'
			>
				<div className='flex justify-between items-start mb-2'>
					<h3
						className='font-semibold text-gray-900 dark:text-white'
						data-testid='lesson-title'
					>
						{lesson.title || 'Lesson'}
					</h3>
					<span
						data-testid='lesson-status'
						className={`px-2 py-1 rounded-full text-xs font-medium ${
							lesson.status === 'COMPLETED'
								? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
								: lesson.status === 'CANCELLED'
								? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
								: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
						}`}
					>
						{lesson.status}
					</span>
				</div>
				<p
					className='text-sm text-gray-600 dark:text-gray-300'
					data-testid='lesson-datetime'
				>
					📅 {new Date(lesson.date).toLocaleDateString()} at {lesson.start_time}
				</p>
				<p
					className='text-sm text-gray-600 dark:text-gray-300'
					data-testid='lesson-teacher'
				>
					👨‍🏫 {lesson.teacher_profile?.full_name || 'Unknown Teacher'}
				</p>
			</div>
		</Link>
	);
}

export default function StudentLessonsPage() {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				const response = await fetch('/api/student/lessons');
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				setLessons(data.lessons || []);
			} catch (err) {
				console.error('Error fetching lessons:', err);
				setError(err instanceof Error ? err.message : 'Failed to load lessons');
			} finally {
				setLoading(false);
			}
		};

		fetchLessons();
	}, []);

	return (
		<RequireStudent>
			<div className='min-h-screen bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800'>
				<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl'>
					<header className='mb-6 sm:mb-8'>
						<h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
							📚 My Lessons
						</h1>
						<p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
							View your upcoming and past lessons
						</p>
					</header>

					{loading && (
						<div
							className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-600 dark:text-gray-300'
							data-testid='loading-state'
						>
							Loading lessons...
						</div>
					)}

					{error && (
						<div
							className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-red-600 dark:text-red-400'
							data-testid='error-state'
						>
							Error: {error}
						</div>
					)}

					{!loading && !error && lessons.length === 0 && (
						<div
							className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center text-gray-600 dark:text-gray-300'
							data-testid='empty-state'
						>
							No lessons scheduled yet. Your teacher will schedule lessons for
							you.
						</div>
					)}

					{!loading && !error && lessons.length > 0 && (
						<div className='grid gap-4' data-testid='lessons-grid'>
							{lessons.map((lesson) => (
								<LessonCard key={lesson.id} lesson={lesson} />
							))}
						</div>
					)}
				</main>
			</div>
		</RequireStudent>
	);
}
