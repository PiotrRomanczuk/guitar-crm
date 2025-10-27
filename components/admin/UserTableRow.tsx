'use client';

import type { User } from '@/schemas/UserSchema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TableCell, TableRow } from '@/components/ui/table';

interface UserTableRowProps {
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

export function UserTableRow({ user, onEdit, onDelete }: UserTableRowProps) {
	const roles = getUserRoles(user);

	return (
		<TableRow>
			<TableCell>
				<div className='flex items-center space-x-3'>
					<Avatar className='w-8 h-8'>
						<AvatarFallback className='bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs'>
							{getInitials(user.firstName, user.lastName)}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className='font-medium'>
							{user.firstName} {user.lastName}
						</div>
					</div>
				</div>
			</TableCell>
			<TableCell className='text-muted-foreground'>{user.email}</TableCell>
			<TableCell>
				<div className='flex flex-wrap gap-1'>
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
			</TableCell>
			<TableCell>
				<Badge variant={user.isActive ? 'default' : 'destructive'}>
					{user.isActive ? '✓ Active' : '✗ Inactive'}
				</Badge>
			</TableCell>
			<TableCell className='text-muted-foreground text-sm'>
				{user.created_at
					? new Date(user.created_at).toLocaleDateString()
					: 'Unknown'}
			</TableCell>
			<TableCell>
				<div className='flex items-center justify-end space-x-2'>
					<Button variant='ghost' size='sm' onClick={onEdit}>
						Edit
					</Button>
					<Button
						variant={user.isActive ? 'destructive' : 'default'}
						size='sm'
						onClick={onDelete}
					>
						{user.isActive ? 'Deactivate' : 'Activate'}
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
