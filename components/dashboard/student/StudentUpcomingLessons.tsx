/**
 * Upcoming Lessons Component for Student Dashboard
 * Displays next scheduled lessons with teacher
 */
export function StudentUpcomingLessons() {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 sm:mb-8'>
			<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2'>
				📅 Upcoming Lessons
				<span className='text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-normal'>
					Coming Soon
				</span>
			</h2>
			<p className='text-gray-600 dark:text-gray-300'>
				Lesson scheduling features are under development. Check back soon!
			</p>
		</div>
	);
}
