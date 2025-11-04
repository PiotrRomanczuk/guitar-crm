interface Props {
	isSubmitting: boolean;
	onCancel: () => void;
}

export function LessonFormActions({ isSubmitting, onCancel }: Props) {
	return (
		<div className='flex flex-col sm:flex-row gap-3 pt-4'>
			<button
				type='submit'
				disabled={isSubmitting}
				className='flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base font-medium'
			>
				{isSubmitting ? 'Creating...' : 'Create Lesson'}
			</button>
			<button
				type='button'
				onClick={onCancel}
				disabled={isSubmitting}
				className='px-4 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base font-medium'
			>
				Cancel
			</button>
		</div>
	);
}
