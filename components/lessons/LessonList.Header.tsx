import Link from 'next/link';

export default function LessonListHeader() {
	return (
		<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
			<h1
				data-testid='page-title'
				className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100'
			>
				Lessons
			</h1>
			<Link
				href='/lessons/new'
				data-testid='create-lesson-button'
				className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium shadow-sm hover:shadow-md'
			>
				+ Create New Lesson
			</Link>
		</div>
	);
}
