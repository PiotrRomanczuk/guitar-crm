'use client';

import { RequireAdmin } from '@/components/auth';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminActionCard } from '@/components/admin/AdminActionCard';

export default function AdminDashboard() {
	return (
		<RequireAdmin>
			<div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
				<main className='container mx-auto px-4 py-8 max-w-7xl'>
					<header className='mb-8'>
						<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
							⚙️ Admin Dashboard
						</h1>
						<p className='text-lg text-gray-600 dark:text-gray-300'>
							System administration and user management
						</p>
					</header>

					<QuickStats />
					<AdminActions />
					<RecentActivity />
				</main>
			</div>
		</RequireAdmin>
	);
}

function QuickStats() {
	return (
		<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
			<AdminStatCard icon='👥' value='--' label='Total Users' />
			<AdminStatCard icon='👨‍🏫' value='--' label='Teachers' />
			<AdminStatCard icon='👨‍🎓' value='--' label='Students' />
			<AdminStatCard icon='🎵' value='--' label='Songs' />
		</div>
	);
}

function AdminActions() {
	const actions = [
		{
			href: '/admin/users',
			icon: '👥',
			title: 'User Management',
			description: 'Create, edit, and manage user accounts and roles',
			linkText: 'Manage Users',
		},
		{
			href: '/admin/settings',
			icon: '⚙️',
			title: 'System Settings',
			description: 'Configure system-wide settings and preferences',
			linkText: 'Open Settings',
		},
		{
			href: '/admin/reports',
			icon: '📊',
			title: 'Reports & Analytics',
			description: 'View system usage and performance metrics',
			linkText: 'View Reports',
		},
		{
			href: '/admin/database',
			icon: '💾',
			title: 'Database Management',
			description: 'Backup, restore, and maintain database',
			linkText: 'Manage Database',
		},
		{
			href: '/admin/logs',
			icon: '📝',
			title: 'Activity Logs',
			description: 'Monitor system activity and user actions',
			linkText: 'View Logs',
		},
		{
			href: '/admin/security',
			icon: '🔒',
			title: 'Security & Permissions',
			description: 'Manage RLS policies and access control',
			linkText: 'Security Settings',
		},
	];

	return (
		<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
			{actions.map((action) => (
				<AdminActionCard key={action.href} {...action} />
			))}
		</div>
	);
}

function RecentActivity() {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
			<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
				Recent Activity
			</h2>
			<p className='text-gray-600 dark:text-gray-300'>
				Activity tracking coming soon...
			</p>
		</div>
	);
}
