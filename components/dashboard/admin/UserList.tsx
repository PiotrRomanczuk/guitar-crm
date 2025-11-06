'use client';

import { useState } from 'react';
import { UserCard } from './UserCard';
import { UserTableRow } from './UserTableRow';
import { UserListEmptyState } from './UserListEmptyState';
import { UserListLoadingState } from './UserListLoadingState';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import type { User } from '@/schemas/UserSchema';

interface UserListProps {
	users: User[];
	loading: boolean;
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	onSearch: (query: string) => void;
}

function UserListContent({
	users,
	onEdit,
	onDelete,
}: {
	users: User[];
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
}) {
	return (
		<div className='space-y-4'>
			{/* Desktop Table View */}
			<div className='hidden lg:block'>
				<div className='rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Roles</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className='text-right'>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<UserTableRow
									key={user.id}
									user={user}
									onEdit={() => onEdit(user)}
									onDelete={() => onDelete(user)}
								/>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Mobile/Tablet Card View */}
			<div className='lg:hidden grid gap-3 sm:gap-4 md:grid-cols-2'>
				{users.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onEdit={() => onEdit(user)}
						onDelete={() => onDelete(user)}
					/>
				))}
			</div>
		</div>
	);
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
		return <UserListLoadingState />;
	}

	if (users.length === 0) {
		return (
			<div className='space-y-4'>
				<div className='mb-4 sm:mb-6'>
					<Input
						type='text'
						placeholder='Search users by name or email...'
						value={searchQuery}
						onChange={handleSearchChange}
					/>
				</div>
				<UserListEmptyState searchQuery={searchQuery} />
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Search Input */}
			<div className='mb-4 sm:mb-6'>
				<Input
					type='text'
					placeholder='Search users by name or email...'
					value={searchQuery}
					onChange={handleSearchChange}
				/>
			</div>
			<UserListContent users={users} onEdit={onEdit} onDelete={onDelete} />
		</div>
	);
}
