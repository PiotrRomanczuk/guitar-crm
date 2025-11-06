'use client';

import { useState, useEffect } from 'react';
import { RequireAdmin } from '@/components/auth';
import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';
import { AdminActionCard } from '@/components/dashboard/admin/AdminActionCard';

type DebugView = 'admin' | 'teacher' | 'student';

export default function AdminDashboard() {
	const [debugView, setDebugView] = useState<DebugView>('admin');

	const getBackgroundColor = () => {
		switch (debugView) {
			case 'teacher':
				return 'from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800';
			case 'student':
				return 'from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800';
			default:
				return 'from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800';
		}
	};

	const getHeader = () => {
		switch (debugView) {
			case 'teacher':
				return {
					icon: '👨‍🏫',
					title: 'Teacher Dashboard Preview',
					description: 'Preview of teacher dashboard (debug mode)',
				};
			case 'student':
				return {
					icon: '👨‍🎓',
					title: 'Student Dashboard Preview',
					description: 'Preview of student dashboard (debug mode)',
				};
			default:
				return {
					icon: '⚙️',
					title: 'Admin Dashboard',
					description: 'System administration and user management',
				};
		}
	};

	const header = getHeader();

	return (
		<RequireAdmin>
			<div className={`min-h-screen bg-linear-to-br ${getBackgroundColor()}`}>
				<main className='container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl'>
					{/* Debug View Selector */}
					{debugView !== 'admin' && (
						<div className='mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg'>
							<p className='text-sm text-amber-800 dark:text-amber-200 mb-3'>
								🔍 <strong>Debug Mode:</strong> You are viewing the {debugView}{' '}
								dashboard perspective. (Only admins can access this debug view.)
							</p>
							<button
								onClick={() => setDebugView('admin')}
								className='text-sm px-3 py-1 bg-amber-200 dark:bg-amber-700 hover:bg-amber-300 dark:hover:bg-amber-600 text-amber-900 dark:text-amber-100 rounded font-medium transition-colors'
							>
								Back to Admin View
							</button>
						</div>
					)}

					<header className='mb-6 sm:mb-8'>
						<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2'>
							{header.icon} {header.title}
						</h1>
						<p className='text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300'>
							{header.description}
						</p>
					</header>

					<QuickStats debugView={debugView} />
					{debugView === 'admin' && <AdminActions />}
					{debugView === 'admin' && <RecentActivity />}

					{/* Debug View Selector - Only show in admin view */}
					{debugView === 'admin' && (
						<DebugViewSelector
							currentView={debugView}
							onViewChange={setDebugView}
						/>
					)}
				</main>
			</div>
		</RequireAdmin>
	);
}

function QuickStats({ debugView }: { debugView: DebugView }) {
	const [stats, setStats] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('/api/dashboard/stats');
				if (response.ok) {
					const data = await response.json();
					if (data.stats) {
						setStats(data.stats);
					}
				}
			} catch (error) {
				console.error('Error fetching admin stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const displayValue = (key: string) => {
		if (loading) return '--';
		return stats[key]?.toString() || '0';
	};

	const getStats = () => {
		switch (debugView) {
			case 'teacher':
				return [
					{ icon: '👨‍🎓', key: 'myStudents', label: 'My Students' },
					{ icon: '🎯', key: 'activeLessons', label: 'Active Lessons' },
					{ icon: '🎵', key: 'songsLibrary', label: 'Songs Library' },
					{ icon: '📊', key: 'studentProgress', label: 'Student Progress' },
				];
			case 'student':
				return [
					{ icon: '👨‍🏫', key: 'myTeacher', label: 'My Teacher' },
					{ icon: '📅', key: 'lessonsDone', label: 'Lessons Done' },
					{ icon: '🎵', key: 'songsLearning', label: 'Songs Learning' },
					{ icon: '⭐', key: 'progress', label: 'Progress' },
				];
			default:
				return [
					{ icon: '👥', key: 'totalUsers', label: 'Total Users' },
					{ icon: '👨‍🏫', key: 'totalTeachers', label: 'Teachers' },
					{ icon: '👨‍🎓', key: 'totalStudents', label: 'Students' },
					{ icon: '🎵', key: 'totalSongs', label: 'Songs' },
				];
		}
	};

	const statsConfig = getStats();

	return (
		<div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8'>
			{statsConfig.map((stat) => (
				<AdminStatCard
					key={stat.label}
					icon={stat.icon}
					value={displayValue(stat.key)}
					label={stat.label}
				/>
			))}
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
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8'>
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

function DebugViewSelector({
	currentView,
	onViewChange,
}: {
	currentView: DebugView;
	onViewChange: (view: DebugView) => void;
}) {
	const viewOptions: Array<{ value: DebugView; label: string; icon: string }> =
		[
			{ value: 'admin', label: 'Admin View', icon: '⚙️' },
			{ value: 'teacher', label: 'Teacher View (Debug)', icon: '👨‍🏫' },
			{ value: 'student', label: 'Student View (Debug)', icon: '👨‍🎓' },
		];

	return (
		<div className='mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
			<h2 className='text-xl font-bold mb-4 text-gray-900 dark:text-white'>
				🔍 Debug Mode: Switch Dashboard View
			</h2>
			<p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
				Admin only: Preview how other roles see their dashboards for testing and
				debugging purposes.
			</p>
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
				{viewOptions.map((option) => (
					<button
						key={option.value}
						onClick={() => onViewChange(option.value)}
						className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
							currentView === option.value
								? 'bg-blue-600 text-white shadow-lg'
								: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
						}`}
					>
						{option.icon} {option.label}
					</button>
				))}
			</div>
		</div>
	);
}
