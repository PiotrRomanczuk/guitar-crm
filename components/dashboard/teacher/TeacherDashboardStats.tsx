'use client';

import { useEffect, useState } from 'react';
import { AdminStatCard } from '@/components/dashboard/admin/AdminStatCard';

interface TeacherStats {
	myStudents: number;
	activeLessons: number;
	songsLibrary: number;
	studentProgress: number;
}

/**
 * Teacher Dashboard Statistics
 * Shows teacher-specific metrics
 */
export function TeacherDashboardStats() {
	const [stats, setStats] = useState<TeacherStats>({
		myStudents: 0,
		activeLessons: 0,
		songsLibrary: 0,
		studentProgress: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch('/api/dashboard/stats');
				if (response.ok) {
					const data = await response.json();
					if (data.role === 'teacher' && data.stats) {
						setStats(data.stats);
					}
				}
			} catch (error) {
				console.error('Error fetching teacher stats:', error);
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
				icon='👨‍🎓'
				value={displayValue(stats.myStudents)}
				label='My Students'
			/>
			<AdminStatCard
				icon='🎯'
				value={displayValue(stats.activeLessons)}
				label='Active Lessons'
			/>
			<AdminStatCard
				icon='🎵'
				value={displayValue(stats.songsLibrary)}
				label='Songs Library'
			/>
			<AdminStatCard
				icon='📊'
				value={displayValue(stats.studentProgress)}
				label='Student Progress'
			/>
		</div>
	);
}
