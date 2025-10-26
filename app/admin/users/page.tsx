'use client';

import { useState, useEffect } from 'react';
import { RequireAdmin } from '@/components/auth';
import { UserList } from '@/components/admin/UserList';
import { UserForm } from '@/components/admin/UserForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { User } from '@/schemas/UserSchema';

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	// Load users
	const loadUsers = async (search?: string) => {
		try {
			setLoading(true);
			setError(null);

			let query = supabase
				.from('profiles')
				.select('*')
				.order('created_at', { ascending: false });

			// Add search filter if provided
			if (search && search.trim()) {
				query = query.or(
					`firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`
				);
			}

			const { data, error: fetchError } = await query.range(0, 49); // Limit to 50 users

			if (fetchError) {
				throw fetchError;
			}

			setUsers(data || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	// Initial load
	useEffect(() => {
		loadUsers();
	}, []);

	// Handle search
	const handleSearch = (query: string) => {
		setSearchQuery(query);
		loadUsers(query);
	};

	// Handle create user
	const handleCreateUser = async (userData: Partial<User>) => {
		try {
			setLoading(true);
			const { error: createError } = await supabase
				.from('profiles')
				.insert([userData]);

			if (createError) {
				throw createError;
			}

			setShowCreateForm(false);
			await loadUsers(searchQuery);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create user');
		} finally {
			setLoading(false);
		}
	};

	// Handle edit user
	const handleEditUser = (user: User) => {
		setEditingUser(user);
	};

	// Handle update user
	const handleUpdateUser = async (userData: Partial<User>) => {
		if (!editingUser) return;

		try {
			setLoading(true);
			const { error: updateError } = await supabase
				.from('profiles')
				.update(userData)
				.eq('id', editingUser.id);

			if (updateError) {
				throw updateError;
			}

			setEditingUser(null);
			await loadUsers(searchQuery);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to update user');
		} finally {
			setLoading(false);
		}
	};

	// Handle delete user
	const handleDeleteUser = async (user: User) => {
		if (
			!confirm(
				`Are you sure you want to delete ${user.firstName} ${user.lastName}?`
			)
		) {
			return;
		}

		try {
			setLoading(true);
			const { error: deleteError } = await supabase
				.from('profiles')
				.update({ isActive: false })
				.eq('id', user.id);

			if (deleteError) {
				throw deleteError;
			}

			await loadUsers(searchQuery);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete user');
		} finally {
			setLoading(false);
		}
	};

	return (
		<RequireAdmin>
			<div className='min-h-screen bg-background'>
				<div className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl'>
					<header className='mb-6 sm:mb-8'>
						<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2'>
							👥 User Management
						</h1>
						<p className='text-xs sm:text-base lg:text-lg text-muted-foreground'>
							Manage users, roles, and permissions
						</p>
					</header>

					{error && (
						<div className='mb-6 rounded-lg border border-destructive bg-destructive/10 p-4'>
							<p className='font-semibold text-destructive text-sm sm:text-base'>
								Error Loading Users
							</p>
							<p className='text-destructive mt-1 text-xs sm:text-sm'>
								{error}
							</p>
						</div>
					)}

					<div className='mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
						<div className='text-xs sm:text-sm text-muted-foreground'>
							{loading
								? 'Loading users...'
								: `${users.length} user${users.length !== 1 ? 's' : ''} found`}
						</div>
						<Button
							onClick={() => setShowCreateForm(true)}
							className='w-full sm:w-auto'
						>
							Create User
						</Button>
					</div>

					<UserList
						users={users}
						loading={loading}
						onEdit={handleEditUser}
						onDelete={handleDeleteUser}
						onSearch={handleSearch}
					/>

					{showCreateForm && (
						<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
							<div className='bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border'>
								<UserForm
									mode='create'
									onSubmit={handleCreateUser}
									onCancel={() => setShowCreateForm(false)}
								/>
							</div>
						</div>
					)}

					{editingUser && (
						<div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
							<div className='bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border'>
								<UserForm
									mode='edit'
									user={editingUser}
									onSubmit={handleUpdateUser}
									onCancel={() => setEditingUser(null)}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</RequireAdmin>
	);
}
