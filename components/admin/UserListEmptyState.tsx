'use client';

interface UserListEmptyStateProps {
	searchQuery: string;
}

export function UserListEmptyState({ searchQuery }: UserListEmptyStateProps) {
	return (
		<div className='text-center py-8 sm:py-12'>
			<div className='text-5xl sm:text-6xl mb-3 sm:mb-4'>👤</div>
			<h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2'>
				No users found
			</h3>
			<p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
				{searchQuery
					? 'Try adjusting your search criteria'
					: 'Create your first user to get started'}
			</p>
		</div>
	);
}
