/**
 * Upcoming Lessons Component for Student Dashboard
 * Displays next scheduled lessons with teacher
 */
export function StudentUpcomingLessons() {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 sm:mb-8'>
			<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
				📅 Upcoming Lessons
			</h2>
			<p className='text-gray-600 dark:text-gray-300'>
				Your upcoming lessons will be displayed here...
			</p>
		</div>
	);
}
