'use client';

import type { User } from '@/schemas/UserSchema';

interface UserCardProps {
	user: User;
	onEdit: () => void;
	onDelete: () => void;
}

const getInitials = (firstName?: string, lastName?: string) => {
	const first = firstName?.charAt(0) ?? 'U';
	const last = lastName?.charAt(0) ?? 'N';
	return `${first}${last}`.toUpperCase();
};

const getRoleColor = (role: string) => {
	switch (role) {
		case 'Admin':
			return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
		case 'Teacher':
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
		case 'Student':
			return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
		default:
			return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
	}
};

const getUserRoles = (user: User) => {
	const roles = [];
	if (user.isAdmin) roles.push('Admin');
	if (user.isTeacher) roles.push('Teacher');
	if (user.isStudent) roles.push('Student');
	return roles;
};

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
	const roles = getUserRoles(user);

	return (
		<div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow'>
			<div className='flex items-start space-x-4'>
				{/* Avatar */}
				<div className='w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
					{getInitials(user.firstName, user.lastName)}
				</div>

				{/* User Info */}
				<div className='flex-1 min-w-0'>
					<h3 className='text-lg font-semibold text-gray-900 dark:text-white truncate'>
						{user.firstName} {user.lastName}
					</h3>
					<p className='text-sm text-gray-600 dark:text-gray-400 truncate'>
						{user.email}
					</p>

					{/* Status */}
					<div className='flex items-center mt-2'>
						<div
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
								user.isActive
									? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
									: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
							}`}
						>
							{user.isActive ? '✓ Active' : '✗ Inactive'}
						</div>
					</div>

					{/* Roles */}
					{roles.length > 0 && (
						<div className='flex flex-wrap gap-1 mt-2'>
							{roles.map((role) => (
								<span
									key={role}
									className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
										role
									)}`}
								>
									{role}
								</span>
							))}
						</div>
					)}

					{/* Created Date */}
					<p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
						Created:{' '}
						{user.created_at
							? new Date(user.created_at).toLocaleDateString()
							: 'Unknown'}
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className='flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
				<button
					onClick={() => onEdit()}
					className='px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors'
				>
					Edit
				</button>
				<button
					onClick={() => onDelete()}
					className='px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors'
				>
					{user.isActive ? 'Deactivate' : 'Activate'}
				</button>
			</div>
		</div>
	);
}
