interface Props {
	filterStatus: string;
	onFilterChange: (status: string) => void;
}

export default function LessonListFilter({
	filterStatus,
	onFilterChange,
}: Props) {
	return (
		<div
			data-testid='lessons-filters'
			className='mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
		>
			<div className='flex flex-col sm:flex-row gap-4'>
				<div className='flex-1'>
					<label
						htmlFor='filter-status'
						className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
					>
						Filter by Status
					</label>
					<select
						id='filter-status'
						data-testid='filter-status'
						value={filterStatus}
						onChange={(e) => onFilterChange(e.target.value)}
						className='w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-lg'
					>
						<option value='all'>All Lessons</option>
						<option value='SCHEDULED'>Scheduled</option>
						<option value='IN_PROGRESS'>In Progress</option>
						<option value='COMPLETED'>Completed</option>
						<option value='CANCELLED'>Cancelled</option>
						<option value='RESCHEDULED'>Rescheduled</option>
					</select>
				</div>
			</div>
		</div>
	);
}
