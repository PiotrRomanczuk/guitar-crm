'use client';

import { useState, useEffect } from 'react';

interface Profile {
	id: string;
	user_id: string;
	email: string;
	firstname: string;
	lastname: string;
	isstudent?: boolean;
	isteacher?: boolean;
}

export function useProfiles() {
	const [students, setStudents] = useState<Profile[]>([]);
	const [teachers, setTeachers] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				console.log('[useProfiles] Fetching profiles from /api/profiles...');
				setLoading(true);
				const response = await fetch('/api/profiles');

				console.log('[useProfiles] Response status:', response.status);
				if (!response.ok) {
					throw new Error('Failed to fetch users');
				}

				const data = await response.json();
				console.log('[useProfiles] Received data:', data);
				console.log('[useProfiles] Data length:', data.length);

				// Filter students and teachers
				const studentList = data.filter((p: Profile) => p.isstudent);
				const teacherList = data.filter((p: Profile) => p.isteacher);

				console.log('[useProfiles] Students:', studentList.length, studentList);
				console.log('[useProfiles] Teachers:', teacherList.length, teacherList);

				setStudents(studentList);
				setTeachers(teacherList);
			} catch (err) {
				console.error('[useProfiles] Error fetching profiles:', err);
				setError(err instanceof Error ? err.message : 'Failed to load users');
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	return { students, teachers, loading, error };
}
