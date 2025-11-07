'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useLessonForm from './useLessonForm';
import { ProfileSelect } from './LessonForm.ProfileSelect';
import { LessonFormFields } from './LessonForm.Fields';
import { LessonFormActions } from './LessonForm.Actions';

export default function LessonForm() {
	const router = useRouter();
	const {
		formData,
		students,
		teachers,
		loading,
		error,
		validationErrors,
		handleChange,
		handleSubmit,
	} = useLessonForm();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		console.log('[LessonForm] Form submitted', formData);
		setIsSubmitting(true);

		try {
			const result = await handleSubmit();
			console.log('[LessonForm] Submit result:', result);
			if (result.success) {
				router.push('/lessons?created=true');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className='text-center py-8 text-gray-600 dark:text-gray-400'>
				Loading form...
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className='space-y-6'>
			{error && (
				<div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400'>
					{error}
				</div>
			)}

			<ProfileSelect
				name='student_id'
				label='Student'
				value={formData.student_id}
				onChange={handleChange}
				options={students}
				error={validationErrors.student_id}
			/>

			<ProfileSelect
				name='teacher_id'
				label='Teacher'
				value={formData.teacher_id}
				onChange={handleChange}
				options={teachers}
				error={validationErrors.teacher_id}
			/>

			<LessonFormFields
				formData={formData}
				validationErrors={validationErrors}
				handleChange={handleChange}
			/>

			<LessonFormActions
				isSubmitting={isSubmitting}
				onCancel={() => router.push('/lessons')}
			/>
		</form>
	);
}
