interface UserFormActionsProps {
	mode: 'create' | 'edit';
	loading: boolean;
	onCancel: () => void;
}

export function UserFormActions({
	mode,
	loading,
	onCancel,
}: UserFormActionsProps) {
	return (
		<div className='flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
			<button
				type='button'
				onClick={onCancel}
				disabled={loading}
				className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50'
			>
				Cancel
			</button>
			<button
				type='submit'
				disabled={loading}
				className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center'
			>
				{loading && (
					<svg
						className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
						fill='none'
						viewBox='0 0 24 24'
					>
						<circle
							cx='12'
							cy='12'
							r='10'
							stroke='currentColor'
							strokeWidth='4'
							className='opacity-25'
						></circle>
						<path
							fill='currentColor'
							d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
							className='opacity-75'
						></path>
					</svg>
				)}
				{mode === 'create' ? 'Create User' : 'Update User'}
			</button>
		</div>
	);
}
