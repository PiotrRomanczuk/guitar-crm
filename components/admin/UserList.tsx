'use client';

import { useState } from 'react';
import { UserCard } from './UserCard';
import type { User } from '@/schemas/UserSchema';

interface UserListProps {
	users: User[];
	loading: boolean;
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	onSearch: (query: string) => void;
}

export function UserList({
	users,
	loading,
	onEdit,
	onDelete,
	onSearch,
}: UserListProps) {
	const [searchQuery, setSearchQuery] = useState('');

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		onSearch(query);
	};

	if (loading) {
		return (
			<div className='space-y-4'>
				<div className='mb-6'>
					<input
						type='text'
						placeholder='Search users by name or email...'
						className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white animate-pulse'
						disabled
					/>
				</div>
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse'
					>
						<div className='flex items-center space-x-4'>
							<div className='w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full'></div>
							<div className='flex-1'>
								<div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2'></div>
								<div className='h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3'></div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Search Input */}
			<div className='mb-6'>
				<input
					type='text'
					placeholder='Search users by name or email...'
					value={searchQuery}
					onChange={handleSearchChange}
					className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div>

			{/* Users Display */}
			{users.length === 0 ? (
				<div className='text-center py-12'>
					<div className='text-6xl mb-4'>👤</div>
					<h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
						No users found
					</h3>
					<p className='text-gray-600 dark:text-gray-400'>
						{searchQuery
							? 'Try adjusting your search criteria'
							: 'Create your first user to get started'}
					</p>
				</div>
			) : (
				<>
					{/* Desktop Table View */}
					<div className='hidden lg:block'>
						<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'>
							<table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
								<thead className='bg-gray-50 dark:bg-gray-900'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											User
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Email
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Roles
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Status
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Created
										</th>
										<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
									{users.map((user) => (
										<UserTableRow
											key={user.id}
											user={user}
											onEdit={() => onEdit(user)}
											onDelete={() => onDelete(user)}
										/>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Mobile/Tablet Card View */}
					<div className='lg:hidden grid gap-4 md:grid-cols-2'>
						{users.map((user) => (
							<UserCard
								key={user.id}
								user={user}
								onEdit={() => onEdit(user)}
								onDelete={() => onDelete(user)}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
