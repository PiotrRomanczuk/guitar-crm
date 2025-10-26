interface UserFormHeaderProps {
	mode: 'create' | 'edit';
	onCancel: () => void;
	generalError?: string;
}

export function UserFormHeader({
	mode,
	onCancel,
	generalError,
}: UserFormHeaderProps) {
	return (
		<>
			<div className='flex items-center justify-between'>
				<h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
					{mode === 'create' ? 'Create New User' : 'Edit User'}
				</h2>
				<button
					type='button'
					onClick={onCancel}
					className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
				>
					✕
				</button>
			</div>

			{generalError && (
				<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
					<p className='text-red-800 dark:text-red-200 text-sm'>
						{generalError}
					</p>
				</div>
			)}
		</>
	);
}
