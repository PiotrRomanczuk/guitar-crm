'use client';

import { RequireTeacher } from '@/components/auth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeacherEditForm } from './EditForm';

interface Profile {
	user_id: string;
	full_name: string | null;
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
	date: string;
	start_time: string;
	title: string;
	notes: string;
	status: string;
}

async function fetchStudents(): Promise<Profile[]> {
	const res = await fetch('/api/teacher/students');
	if (!res.ok) return [];
	const data = await res.json();
	return data.students || [];
}

async function fetchLesson(id: string): Promise<Lesson | null> {
	const res = await fetch(`/api/teacher/lessons?id=${id}`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.lessons?.[0] || null;
}

function useData(id: string) {
	const [loading, setLoading] = useState(true);
	const [students, setStudents] = useState<Profile[]>([]);
	const [formData, setFormData] = useState<FormData>({
		student_id: '',
		date: '',
		start_time: '',
		title: '',
		notes: '',
		status: 'SCHEDULED',
	});

	useEffect(() => {
		Promise.all([fetchStudents(), fetchLesson(id)])
			.then(([stds, lesson]) => {
				setStudents(stds);
				if (lesson) {
					setFormData({
						student_id: lesson.student_id,
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

	return { loading, students, formData, setFormData };
}

function useActions(id: string) {
	const router = useRouter();
	const [saving, setSaving] = useState(false);

	const handleSubmit = async (formData: FormData) => {
		setSaving(true);
		try {
			const res = await fetch('/api/teacher/lessons', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, ...formData }),
			});
			if (res.ok) {
				router.push('/teacher/lessons');
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
		const res = await fetch('/api/teacher/lessons', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id }),
		});
		if (res.ok) {
			router.push('/teacher/lessons');
		} else {
			const error = await res.json();
			alert(`Error: ${error.error || 'Failed to delete'}`);
		}
	};

	return { saving, handleSubmit, handleDelete };
}

export default function TeacherLessonDetailPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;
	const { loading, students, formData, setFormData } = useData(id);
	const { saving, handleSubmit, handleDelete } = useActions(id);

	if (loading) {
		return (
			<RequireTeacher>
				<div
					className='container mx-auto px-4 py-8'
					data-testid='loading-state'
				>
					Loading...
				</div>
			</RequireTeacher>
		);
	}

	return (
		<RequireTeacher>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<div className='flex items-center justify-between mb-6'>
						<h1 className='text-2xl font-bold'>Edit Lesson</h1>
						<button onClick={() => router.back()}>Cancel</button>
					</div>

					<TeacherEditForm
						formData={formData}
						students={students}
						saving={saving}
						onSubmit={handleSubmit}
						onDelete={handleDelete}
						onChange={(updates) => setFormData({ ...formData, ...updates })}
					/>
				</div>
			</div>
		</RequireTeacher>
	);
}
