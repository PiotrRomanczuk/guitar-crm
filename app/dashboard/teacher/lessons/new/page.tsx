'use client';

import { RequireTeacher } from '@/components/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
	user_id: string;
	full_name: string | null;
	isStudent: boolean | null;
}

interface FormData {
	student_id: string;
	date: string;
	start_time: string;
	title: string;
	notes: string;
	status: string;
}

const inputClass =
	'w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white';
const labelClass =
	'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

function StudentSelect({
	value,
	onChange,
	students,
}: {
	value: string;
	onChange: (v: string) => void;
	students: Profile[];
}) {
	return (
		<div>
			<label className={labelClass}>Student *</label>
			<select
				required
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={inputClass}
				data-testid='student-select'
			>
				<option value=''>Select a student</option>
				{students.map((s) => (
					<option key={s.user_id} value={s.user_id}>
						{s.full_name || 'Unnamed Student'}
					</option>
				))}
			</select>
		</div>
	);
}

function DateTimeInputs({
	date,
	time,
	onDateChange,
	onTimeChange,
}: {
	date: string;
	time: string;
	onDateChange: (v: string) => void;
	onTimeChange: (v: string) => void;
}) {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
			<div>
				<label className={labelClass}>Date *</label>
				<input
					type='date'
					required
					value={date}
					onChange={(e) => onDateChange(e.target.value)}
					className={inputClass}
					data-testid='date-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Start Time *</label>
				<input
					type='time'
					required
					value={time}
					onChange={(e) => onTimeChange(e.target.value)}
					className={inputClass}
					data-testid='time-input'
				/>
			</div>
		</div>
	);
}

function LessonDetails({
	title,
	notes,
	status,
	onTitleChange,
	onNotesChange,
	onStatusChange,
}: {
	title: string;
	notes: string;
	status: string;
	onTitleChange: (v: string) => void;
	onNotesChange: (v: string) => void;
	onStatusChange: (v: string) => void;
}) {
	return (
		<>
			<div>
				<label className={labelClass}>Title</label>
				<input
					type='text'
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					placeholder='e.g., Guitar Basics'
					className={inputClass}
					data-testid='title-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Notes</label>
				<textarea
					value={notes}
					onChange={(e) => onNotesChange(e.target.value)}
					rows={3}
					placeholder='Add notes...'
					className={inputClass}
					data-testid='notes-input'
				/>
			</div>
			<div>
				<label className={labelClass}>Status</label>
				<select
					value={status}
					onChange={(e) => onStatusChange(e.target.value)}
					className={inputClass}
					data-testid='status-select'
				>
					<option value='SCHEDULED'>Scheduled</option>
					<option value='IN_PROGRESS'>In Progress</option>
					<option value='COMPLETED'>Completed</option>
					<option value='CANCELLED'>Cancelled</option>
				</select>
			</div>
		</>
	);
}

function useLessonForm() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
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
		const fetchStudents = async () => {
			try {
				const res = await fetch('/api/teacher/students');
				if (res.ok) {
					const data = await res.json();
					setStudents(data.students || []);
				}
			} catch (error) {
				console.error('Error fetching students:', error);
			}
		};
		fetchStudents();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await fetch('/api/teacher/lessons', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});
			if (res.ok) {
				router.push('/teacher/lessons');
			} else {
				const error = await res.json();
				alert(`Error: ${error.error || 'Failed to create lesson'}`);
			}
		} catch (error) {
			console.error('Error creating lesson:', error);
			alert('Failed to create lesson');
		} finally {
			setLoading(false);
		}
	};

	return { loading, students, formData, setFormData, handleSubmit };
}

export default function TeacherNewLessonPage() {
	const router = useRouter();
	const { loading, students, formData, setFormData, handleSubmit } =
		useLessonForm();

	return (
		<RequireTeacher>
			<div className='container mx-auto px-4 py-8'>
				<div className='max-w-2xl mx-auto'>
					<div className='flex items-center justify-between mb-6'>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
							Create New Lesson
						</h1>
						<button
							onClick={() => router.back()}
							className='text-gray-600 dark:text-gray-400'
						>
							Cancel
						</button>
					</div>

					<form
						onSubmit={handleSubmit}
						className='bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4'
					>
						<StudentSelect
							value={formData.student_id}
							onChange={(v) => setFormData({ ...formData, student_id: v })}
							students={students}
						/>
						<DateTimeInputs
							date={formData.date}
							time={formData.start_time}
							onDateChange={(v) => setFormData({ ...formData, date: v })}
							onTimeChange={(v) => setFormData({ ...formData, start_time: v })}
						/>
						<LessonDetails
							title={formData.title}
							notes={formData.notes}
							status={formData.status}
							onTitleChange={(v) => setFormData({ ...formData, title: v })}
							onNotesChange={(v) => setFormData({ ...formData, notes: v })}
							onStatusChange={(v) => setFormData({ ...formData, status: v })}
						/>

						<div className='flex gap-3 pt-4'>
							<button
								type='submit'
								disabled={loading}
								className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50'
								data-testid='submit-button'
							>
								{loading ? 'Creating...' : 'Create Lesson'}
							</button>
							<button
								type='button'
								onClick={() => router.back()}
								className='px-6 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		</RequireTeacher>
	);
}
