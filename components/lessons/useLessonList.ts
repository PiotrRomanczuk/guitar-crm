'use client';

import { useState, useEffect } from 'react';
import { LessonWithProfiles } from '@/schemas/LessonSchema';

export default function useLessonList() {
	const [lessons, setLessons] = useState<LessonWithProfiles[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<string>('all');

	useEffect(() => {
		const fetchLessons = async () => {
			try {
				setLoading(true);
				setError(null);

				const params = new URLSearchParams();
				if (filterStatus !== 'all') {
					params.append('status', filterStatus);
				}

				const response = await fetch(`/api/lessons?${params.toString()}`);

				if (!response.ok) {
					throw new Error(`Failed to fetch lessons: ${response.statusText}`);
				}

				const data = await response.json();
				setLessons(data.lessons || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setLoading(false);
			}
		};

		fetchLessons();
	}, [filterStatus]);

	const refresh = async () => {
		try {
			setLoading(true);
			setError(null);

			const params = new URLSearchParams();
			if (filterStatus !== 'all') {
				params.append('status', filterStatus);
			}

			const response = await fetch(`/api/lessons?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch lessons: ${response.statusText}`);
			}

			const data = await response.json();
			setLessons(data.lessons || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	return {
		lessons,
		loading,
		error,
		filterStatus,
		setFilterStatus,
		refresh,
	};
}
