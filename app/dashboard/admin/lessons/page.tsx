'use client';

import { RequireAdmin } from '@/components/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Lesson {
	id: string;
	date: string;
	start_time: string;
	title?: string;
	status: string;
	student_profile?: { full_name: string | null };
	teacher_profile?: { full_name: string | null };
}

function LessonTableRow({ lesson }: { lesson: Lesson }) {
	return (
		<tr
			className='hover:bg-gray-50 dark:hover:bg-gray-700'
			data-testid='lesson-row'
		>
			<td
				className='px-4 py-3 text-sm text-gray-900 dark:text-white'
				data-testid='lesson-date'
			>
				{new Date(lesson.date).toLocaleDateString()}
			</td>
			<td
				className='px-4 py-3 text-sm text-gray-900 dark:text-white'
				data-testid='lesson-time'
			>
				{lesson.start_time}
			</td>
			<td
				className='px-4 py-3 text-sm text-gray-900 dark:text-white'
				data-testid='lesson-title'
			>
				{lesson.title || '-'}
			</td>
			<td
				className='px-4 py-3 text-sm text-gray-900 dark:text-white'
				data-testid='lesson-student'
			>
				{lesson.student_profile?.full_name || 'Unknown'}
			</td>
			<td
				className='px-4 py-3 text-sm text-gray-900 dark:text-white'
				data-testid='lesson-teacher'
			>
				{lesson.teacher_profile?.full_name || 'Unknown'}
			</td>
			<td className='px-4 py-3 text-sm'>
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
			</td>
			<td className='px-4 py-3 text-sm'>
				<Link
					href={`/admin/lessons/${lesson.id}`}
					className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
					data-testid='lesson-view-link'
				>
					View
				</Link>
			</td>
		</tr>
	);
}

function LessonTable({ lessons }: { lessons: Lesson[] }) {
	return (
		<div className='overflow-x-auto'>
			<table className='w-full'>
				<thead className='bg-gray-50 dark:bg-gray-700'>
					<tr>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Date
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Time
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Title
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Student
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Teacher
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Status
						</th>
						<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
							Actions
						</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
					{lessons.map((lesson) => (
						<LessonTableRow key={lesson.id} lesson={lesson} />
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function AdminLessonsPage() {
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				const response = await fetch('/api/lessons');
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
		<RequireAdmin>
			<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
				<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl'>
					<header className='mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
						<div>
							<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2'>
								📚 Lesson Management
							</h1>
							<p className='text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300'>
								Manage all lessons across the system
							</p>
						</div>
						<Link
							href='/admin/lessons/new'
							className='w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center'
							data-testid='new-lesson-button'
						>
							+ New Lesson
						</Link>
					</header>

					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md'>
						{loading && (
							<div
								className='p-8 text-center text-gray-600 dark:text-gray-300'
								data-testid='loading-state'
							>
								Loading lessons...
							</div>
						)}

						{error && (
							<div
								className='p-8 text-center text-red-600 dark:text-red-400'
								data-testid='error-state'
							>
								Error: {error}
							</div>
						)}

						{!loading && !error && lessons.length === 0 && (
							<div
								className='p-8 text-center text-gray-600 dark:text-gray-300'
								data-testid='empty-state'
							>
								No lessons found. Create your first lesson!
							</div>
						)}

						{!loading && !error && lessons.length > 0 && (
							<div data-testid='lessons-table'>
								<LessonTable lessons={lessons} />
							</div>
						)}
					</div>
				</main>
			</div>
		</RequireAdmin>
	);
}
