'use client';

import { RequireAdmin } from '@/components/auth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EditForm } from './EditForm';

interface Profile {
	user_id: string;
	full_name: string | null;
	isTeacher: boolean | null;
	isStudent: boolean | null;
}

interface Lesson {
	id: string;
	student_id: string;
	teacher_id: string;
	date: string | null;
	start_time: string | null;
	title: string | null;
	notes: string | null;
	status: string | null;
}

interface FormData {
	student_id: string;
	teacher_id: string;
	date: string;
	start_time: string;
	title: string;
	notes: string;
	status: string;
}

async function fetchUsers() {
	const res = await fetch('/api/admin/users');
	if (!res.ok) return { teachers: [], students: [] };
	const data = await res.json();
	return {
		teachers: data.users?.filter((u: Profile) => u.isTeacher) || [],
		students: data.users?.filter((u: Profile) => u.isStudent) || [],
	};
}

async function fetchLesson(id: string): Promise<Lesson | null> {
	const res = await fetch(`/api/admin/lessons?id=${id}`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.lessons?.[0] || null;
}

function useData(id: string) {
	const [loading, setLoading] = useState(true);
	const [teachers, setTeachers] = useState<Profile[]>([]);
	const [students, setStudents] = useState<Profile[]>([]);
	const [formData, setFormData] = useState<FormData>({
		student_id: '',
		teacher_id: '',
		date: '',
		start_time: '',
		title: '',
		notes: '',
		status: 'SCHEDULED',
	});

	useEffect(() => {
		Promise.all([fetchUsers(), fetchLesson(id)])
			.then(([users, lesson]) => {
				setTeachers(users.teachers);
				setStudents(users.students);
				if (lesson) {
					setFormData({
						student_id: lesson.student_id,
						teacher_id: lesson.teacher_id,
						date: lesson.date || '',
						start_time: lesson.start_time || '',
						title: lesson.title || '',
						notes: lesson.notes || '',
						status: lesson.status || 'SCHEDULED',
					});
				}
			})
			.finally(() => setLoading(false));
	}, [id]);

	return { loading, teachers, students, formData, setFormData };
}

function useActions(id: string) {
	const router = useRouter();
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (formData: FormData) => {
		setSaving(true);
		try {
			const res = await fetch('/api/admin/lessons', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, ...formData }),
			});
			if (res.ok) {
				router.push('/admin/lessons');
			} else {
				const error = await res.json();
				alert(`Error: ${error.error || 'Failed to update lesson'}`);
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this lesson?')) return;
		const res = await fetch('/api/admin/lessons', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id }),
		});
		if (res.ok) {
			router.push('/admin/lessons');
		} else {
			const error = await res.json();
			alert(`Error: ${error.error || 'Failed to delete'}`);
		}
	};

	return { saving, handleSubmit, handleDelete };
}

export default function AdminLessonDetailPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const { loading, teachers, students, formData, setFormData } = useData(id);
	const { saving, handleSubmit, handleDelete } = useActions(id);

	if (loading) {
		return (
			<RequireAdmin>
				<div
					className='container mx-auto px-4 py-8'
					data-testid='loading-state'
				>
					Loading...
				</div>
			</RequireAdmin>
		);
	}

	return (
		<RequireAdmin>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<div className='flex items-center justify-between mb-6'>
						<h1 className='text-2xl font-bold'>Edit Lesson</h1>
						<button onClick={() => router.back()}>Cancel</button>
					</div>

					<EditForm
						formData={formData}
						teachers={teachers}
						students={students}
						saving={saving}
						onSubmit={handleSubmit}
						onDelete={handleDelete}
						onChange={(updates) => setFormData({ ...formData, ...updates })}
					/>
				</div>
			</div>
		</RequireAdmin>
	);
}
