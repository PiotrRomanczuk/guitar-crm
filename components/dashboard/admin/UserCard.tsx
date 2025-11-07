'use client';

import type { User } from '@/schemas/UserSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

const getRoleVariant = (role: string) => {
	switch (role) {
		case 'Admin':
			return 'destructive' as const;
		case 'Teacher':
			return 'default' as const;
		case 'Student':
			return 'secondary' as const;
		default:
			return 'outline' as const;
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
		<Card className='hover:shadow-lg transition-shadow'>
			<CardContent className='p-3 sm:p-4'>
				<div className='flex items-start space-x-3 sm:space-x-4'>
					{/* Avatar */}
					<Avatar className='w-10 h-10 sm:w-12 sm:h-12'>
						<AvatarFallback className='bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs sm:text-sm'>
							{getInitials(user.firstName, user.lastName)}
						</AvatarFallback>
					</Avatar>

					{/* User Info */}
					<div className='flex-1 min-w-0'>
						<h3 className='text-base sm:text-lg font-semibold truncate'>
							{user.firstName} {user.lastName}
						</h3>
						<p className='text-xs sm:text-sm text-muted-foreground truncate'>
							{user.email}
						</p>

						{/* Status */}
						<div className='flex items-center mt-1 sm:mt-2'>
							<Badge
								variant={user.isActive ? 'default' : 'destructive'}
								className='text-xs'
							>
								{user.isActive ? '✓ Active' : '✗ Inactive'}
							</Badge>
						</div>

						{/* Roles */}
						{roles.length > 0 && (
							<div className='flex flex-wrap gap-1 mt-1 sm:mt-2'>
								{roles.map((role) => (
									<Badge
										key={role}
										variant={getRoleVariant(role)}
										className='text-xs'
									>
										{role}
									</Badge>
								))}
							</div>
						)}

						{/* Created Date */}
						<p className='text-xs text-muted-foreground mt-1 sm:mt-2'>
							Created:{' '}
							{user.created_at
								? new Date(user.created_at).toLocaleDateString()
								: 'Unknown'}
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className='flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t'>
					<Button
						variant='ghost'
						size='sm'
						className='w-full sm:w-auto'
						onClick={() => onEdit()}
					>
						Edit
					</Button>
					<Button
						variant={user.isActive ? 'destructive' : 'default'}
						size='sm'
						className='w-full sm:w-auto'
						onClick={() => onDelete()}
					>
						{user.isActive ? 'Deactivate' : 'Activate'}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
