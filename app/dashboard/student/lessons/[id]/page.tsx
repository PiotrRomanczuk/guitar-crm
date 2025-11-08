'use client';

import { RequireStudent } from '@/components/auth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Lesson {
	id: string;
	student_id: string;
	teacher_id: string;
	date: string | null;
	start_time: string | null;
	title: string | null;
	notes: string | null;
	status: string | null;
	profile?: {
		full_name: string | null;
		email: string | null;
	};
	teacher_profile?: {
		full_name: string | null;
		email: string | null;
	};
}

function LessonDetail({ lesson }: { lesson: Lesson }) {
	const statusColors = {
		SCHEDULED: 'bg-blue-100 text-blue-800',
		IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
		COMPLETED: 'bg-green-100 text-green-800',
		CANCELLED: 'bg-red-100 text-red-800',
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'>
			<div>
				<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
					Status
				</label>
				<span
					className={`inline-block px-3 py-1 rounded-full text-sm ${
						statusColors[lesson.status as keyof typeof statusColors] ||
						'bg-gray-100 text-gray-800'
					}`}
					data-testid='lesson-status'
				>
					{lesson.status}
				</span>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Date
					</label>
					<p
						className='text-gray-900 dark:text-white'
						data-testid='lesson-date'
					>
						{lesson.date
							? new Date(lesson.date).toLocaleDateString()
							: 'Not set'}
					</p>
				</div>
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Start Time
					</label>
					<p
						className='text-gray-900 dark:text-white'
						data-testid='lesson-time'
					>
						{lesson.start_time || 'Not set'}
					</p>
				</div>
			</div>

			<div>
				<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
					Teacher
				</label>
				<p className='text-gray-900 dark:text-white' data-testid='teacher-name'>
					{lesson.teacher_profile?.full_name || 'Not assigned'}
				</p>
			</div>

			{lesson.title && (
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Title
					</label>
					<p
						className='text-gray-900 dark:text-white'
						data-testid='lesson-title'
					>
						{lesson.title}
					</p>
				</div>
			)}

			{lesson.notes && (
				<div>
					<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
						Notes
					</label>
					<p
						className='text-gray-900 dark:text-white whitespace-pre-wrap'
						data-testid='lesson-notes'
					>
						{lesson.notes}
					</p>
				</div>
			)}
		</div>
	);
}

async function fetchLesson(id: string): Promise<Lesson | null> {
	const res = await fetch(`/api/student/lessons?id=${id}`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.lessons?.[0] || null;
}

export default function StudentLessonDetailPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const [loading, setLoading] = useState(true);
	const [lesson, setLesson] = useState<Lesson | null>(null);

	useEffect(() => {
		fetchLesson(id)
			.then(setLesson)
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) {
		return (
			<RequireStudent>
				<div
					className='container mx-auto px-4 py-8'
					data-testid='loading-state'
				>
					Loading...
				</div>
			</RequireStudent>
		);
	}

	if (!lesson) {
		return (
			<RequireStudent>
				<div className='container mx-auto px-4 py-8' data-testid='error-state'>
					<p className='text-red-600'>Lesson not found</p>
				</div>
			</RequireStudent>
		);
	}

	return (
		<RequireStudent>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<div className='flex items-center justify-between mb-6'>
						<h1 className='text-2xl font-bold'>Lesson Details</h1>
						<button
							onClick={() => router.back()}
							className='text-gray-600 dark:text-gray-400'
						>
							Back
						</button>
					</div>

					<LessonDetail lesson={lesson} />
				</div>
			</div>
		</RequireStudent>
	);
}
