'use client';

import { useEffect, useState } from 'react';
import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';

interface StudentStats {
	myTeacher: number;
	lessonsDone: number;
	songsLearning: number;
	progress: number;
}

/**
 * Student Dashboard Statistics
 * Shows student-specific metrics
 */
export function StudentDashboardStats() {
	const [stats, setStats] = useState<StudentStats>({
		myTeacher: 0,
		lessonsDone: 0,
		songsLearning: 0,
		progress: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('/api/dashboard/stats');
				if (response.ok) {
					const data = await response.json();
					if (data.role === 'student' && data.stats) {
						setStats(data.stats);
					}
				}
			} catch (error) {
				console.error('Error fetching student stats:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	const displayValue = (value: number) => (loading ? '--' : value.toString());

	return (
		<div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8'>
			<AdminStatCard
				icon='👨‍🏫'
				value={displayValue(stats.myTeacher)}
				label='My Teacher'
			/>
			<AdminStatCard
				icon='📅'
				value={displayValue(stats.lessonsDone)}
				label='Lessons Done'
			/>
			<AdminStatCard
				icon='🎵'
				value={displayValue(stats.songsLearning)}
				label='Songs Learning'
			/>
			<AdminStatCard
				icon='⭐'
				value={displayValue(stats.progress)}
				label='Progress'
			/>
		</div>
	);
}
